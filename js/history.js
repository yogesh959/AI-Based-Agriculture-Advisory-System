const HISTORY_API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", function () {
    setupSelectionControls("crop");
    setupSelectionControls("image");
    loadReportHistory();
});

async function loadReportHistory() {
    const cropRows = document.getElementById("cropHistoryRows");
    const diseaseRows = document.getElementById("diseaseHistoryRows");

    try {
        const [cropResponse, diseaseResponse] = await Promise.all([
            fetch(`${HISTORY_API_URL}/history?limit=50&type=crop`),
            fetch(`${HISTORY_API_URL}/history?limit=50&type=image`)
        ]);
        if (!cropResponse.ok || !diseaseResponse.ok) {
            throw new Error("Farm report history is unavailable.");
        }

        const [cropData, diseaseData] = await Promise.all([
            cropResponse.json(),
            diseaseResponse.json()
        ]);
        renderCropHistory(cropRows, cropData.history || []);
        renderDiseaseHistory(diseaseRows, diseaseData.history || []);
        resetSelectionControls("crop");
        resetSelectionControls("image");
    } catch (error) {
        console.error(error);
        addHistoryMessage(cropRows, "Could not load crop history. Check the backend and database.");
        addHistoryMessage(diseaseRows, "Could not load disease history. Check the backend and database.");
    }
}

function renderCropHistory(tableBody, entries) {
    if (!tableBody) return;
    tableBody.replaceChildren();
    if (entries.length === 0) {
        addHistoryMessage(tableBody, "No crop recommendations have been saved yet.");
        return;
    }

    entries.forEach((entry) => {
        const crop = getRecommendationField(entry.answer, "Recommended crop:");
        const confidence = getRecommendationField(entry.answer, "Confidence:");
        addHistoryRow(tableBody, [
            new Date(entry.created_at).toLocaleString(),
            crop,
            confidence,
            entry.question
            ], "crop", entry.id);
    });
}

function renderDiseaseHistory(tableBody, entries) {
    if (!tableBody) return;
    tableBody.replaceChildren();
    if (entries.length === 0) {
        addHistoryMessage(tableBody, "No disease scans have been saved yet.");
        return;
    }

    entries.forEach((entry) => {
        addHistoryRow(tableBody, [
            new Date(entry.created_at).toLocaleString(),
            entry.image_name || "Uploaded photo",
            entry.question,
            entry.answer
        ], "image", entry.id);
    });
}

function addHistoryRow(tableBody, values, entryType, entryId) {
    const row = document.createElement("tr");
    const selectionCell = document.createElement("td");
    selectionCell.className = "history-selection";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "history-row-select";
    checkbox.value = String(entryId);
    checkbox.setAttribute("aria-label", `Select saved ${entryType === "crop" ? "crop recommendation" : "disease scan"}`);
    selectionCell.appendChild(checkbox);
    row.appendChild(selectionCell);

    values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });
    tableBody.appendChild(row);
}

function setupSelectionControls(entryType) {
    const isCrop = entryType === "crop";
    const rows = document.getElementById(isCrop ? "cropHistoryRows" : "diseaseHistoryRows");
    const selectAll = document.getElementById(isCrop ? "selectAllCrop" : "selectAllDisease");
    const deleteButton = document.getElementById(isCrop ? "deleteCropSelected" : "deleteDiseaseSelected");

    if (!rows || !selectAll || !deleteButton) return;

    rows.addEventListener("change", () => updateSelectionControls(rows, selectAll, deleteButton));
    selectAll.addEventListener("change", () => {
        rows.querySelectorAll(".history-row-select").forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
        });
        updateSelectionControls(rows, selectAll, deleteButton);
    });
    deleteButton.addEventListener("click", () => deleteSelectedHistory(entryType, rows, selectAll, deleteButton));
}

function updateSelectionControls(rows, selectAll, deleteButton) {
    const checkboxes = [...rows.querySelectorAll(".history-row-select")];
    const selectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
    deleteButton.disabled = selectedCount === 0;
    selectAll.checked = checkboxes.length > 0 && selectedCount === checkboxes.length;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
}

function resetSelectionControls(entryType) {
    const isCrop = entryType === "crop";
    const selectAll = document.getElementById(isCrop ? "selectAllCrop" : "selectAllDisease");
    const deleteButton = document.getElementById(isCrop ? "deleteCropSelected" : "deleteDiseaseSelected");
    if (!selectAll || !deleteButton) return;

    selectAll.checked = false;
    selectAll.indeterminate = false;
    deleteButton.disabled = true;
}

async function deleteSelectedHistory(entryType, rows, selectAll, deleteButton) {
    const ids = [...rows.querySelectorAll(".history-row-select:checked")].map((checkbox) => checkbox.value);
    if (ids.length === 0) return;

    const label = entryType === "crop" ? "crop recommendation" : "disease scan";
    const confirmation = window.translateForCurrentLanguage(
        `Delete ${ids.length} selected ${label}${ids.length === 1 ? "" : "s"}? This cannot be undone.`
    );
    if (!window.confirm(confirmation)) {
        return;
    }

    deleteButton.disabled = true;
    try {
        const response = await fetch(`${HISTORY_API_URL}/history`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, entryType })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Selected history could not be deleted.");
        await loadReportHistory();
    } catch (error) {
        console.error(error);
        window.alert(window.translateForCurrentLanguage(error.message || "Selected history could not be deleted."));
        updateSelectionControls(rows, selectAll, deleteButton);
    }
}

function getRecommendationField(answer, fieldName) {
    const line = String(answer || "").split(/\r?\n/).find((value) => value.startsWith(fieldName));
    return line ? line.slice(fieldName.length).trim() : "Not available";
}

function addHistoryMessage(tableBody, message) {
    if (!tableBody) return;
    tableBody.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = message;
    row.appendChild(cell);
    tableBody.appendChild(row);
}