const mysql = require("mysql2/promise");

const requiredSettings = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);

const pool = missingSettings.length === 0
    ? mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    })
    : null;

async function checkConnection() {
    if (!pool) {
        return { status: "not_configured", missing: missingSettings };
    }

    await pool.query("SELECT 1");
    return { status: "connected" };
}

async function initializeHistoryTable() {
    if (!pool) return false;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS assistant_history (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            question TEXT NOT NULL,
            answer MEDIUMTEXT NOT NULL,
            entry_type VARCHAR(24) NOT NULL DEFAULT 'text',
            image_name VARCHAR(255) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_assistant_history_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [columns] = await pool.query("SHOW COLUMNS FROM assistant_history LIKE 'entry_type'");
    if (columns[0]?.Type.toLowerCase().startsWith("enum(")) {
        await pool.query(
            "ALTER TABLE assistant_history MODIFY entry_type VARCHAR(24) NOT NULL DEFAULT 'text'"
        );
    }

    return true;
}

async function saveHistory({ question, answer, entryType, imageName = null }) {
    if (!pool) throw new Error("MySQL database is not configured");

    const [result] = await pool.execute(
        `INSERT INTO assistant_history (question, answer, entry_type, image_name)
         VALUES (?, ?, ?, ?)`,
        [question, answer, entryType, imageName]
    );
    return result.insertId;
}

async function getHistory(limit = 50, entryTypes = []) {
    if (!pool) throw new Error("MySQL database is not configured");

    const typeFilter = entryTypes.length
        ? `WHERE entry_type IN (${entryTypes.map(() => "?").join(", ")})`
        : "";
    const values = [...entryTypes, limit];
    const [rows] = await pool.execute(
        `SELECT id, question, answer, entry_type, image_name, created_at
         FROM assistant_history
         ${typeFilter}
         ORDER BY created_at DESC, id DESC
         LIMIT ?`,
        values
    );
    return rows;
}

async function deleteHistory(ids, entryType) {
    if (!pool) throw new Error("MySQL database is not configured");

    const placeholders = ids.map(() => "?").join(", ");
    const [result] = await pool.execute(
        `DELETE FROM assistant_history WHERE entry_type = ? AND id IN (${placeholders})`,
        [entryType, ...ids]
    );
    return result.affectedRows;
}

module.exports = { checkConnection, deleteHistory, getHistory, initializeHistoryTable, pool, saveHistory };