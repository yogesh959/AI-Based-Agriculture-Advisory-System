(function () {
    "use strict";

    const API_URL = "http://localhost:5000";
    let cropChart;
    let activityChart;

    document.addEventListener("DOMContentLoaded", loadAnalytics);

    async function loadAnalytics() {
        let cropEntries = [];
        let imageEntries = [];

        try {
            const [cropResponse, imageResponse] = await Promise.all([
                fetch(`${API_URL}/history?limit=100&type=crop`),
                fetch(`${API_URL}/history?limit=100&type=image`)
            ]);
            if (cropResponse.ok) cropEntries = (await cropResponse.json()).history || [];
            if (imageResponse.ok) imageEntries = (await imageResponse.json()).history || [];
        } catch (error) {
            console.warn("Analytics history unavailable:", error);
        }

        const localActivities = window.AgriActivityLog ? window.AgriActivityLog.read() : [];
        const weatherCount = localActivities.filter((item) => item.type === "weather").length;
        const chatCount = localActivities.filter((item) => item.type === "chat").length;

        document.getElementById("cropCount").textContent = cropEntries.length;
        document.getElementById("diseaseCount").textContent = imageEntries.length;
        document.getElementById("weatherCount").textContent = weatherCount;
        document.getElementById("chatCount").textContent = chatCount;

        document.getElementById("cropChange").textContent = cropEntries.length ? "Recorded" : "0";
        document.getElementById("diseaseChange").textContent = imageEntries.length ? "Recorded" : "0";
        document.getElementById("weatherChange").textContent = weatherCount ? "Recorded" : "0";
        document.getElementById("chatChange").textContent = chatCount ? "Recorded" : "0";

        renderCropChart(cropEntries);
        renderActivityChart(cropEntries.length, imageEntries.length, weatherCount, chatCount);
        renderActivityTable(cropEntries, imageEntries, localActivities);
        document.getElementById("analyticsUpdated").textContent =
            cropEntries.length || imageEntries.length || localActivities.length
                ? "Updated from recent activity"
                : "No activity recorded";
    }

    function renderCropChart(entries) {
        const counts = {};
        entries.forEach((entry) => {
            const crop = getField(entry.answer, "Recommended crop:");
            counts[crop] = (counts[crop] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const values = Object.values(counts);
        const canvas = document.getElementById("cropChart");

        cropChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels.length ? labels : ["No predictions"],
                datasets: [{
                    label: "Recommendations",
                    data: values.length ? values : [0],
                    backgroundColor: "#16a34a",
                    borderRadius: 8,
                    barThickness: 28
                }]
            },
            options: chartOptions()
        });
    }

    function renderActivityChart(crops, disease, weather, chat) {
        const canvas = document.getElementById("activityChart");
        activityChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Crop", "Disease", "Weather", "AI chat"],
                datasets: [{
                    data: [crops, disease, weather, chat],
                    backgroundColor: ["#16a34a", "#38bdf8", "#f59e0b", "#8b5cf6"],
                    borderWidth: 4,
                    borderColor: "#ffffff",
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#64748b", boxWidth: 10, usePointStyle: true, padding: 16 }
                    }
                }
            }
        });
    }

    function renderActivityTable(cropEntries, imageEntries, localActivities) {
        const rows = [];

        cropEntries.forEach((entry) => rows.push({
            date: entry.created_at,
            module: "Crop prediction",
            result: getField(entry.answer, "Recommended crop:")
        }));
        imageEntries.forEach((entry) => rows.push({
            date: entry.created_at,
            module: "Disease scan",
            result: entry.image_name || "Image analysis completed"
        }));
        localActivities.forEach((entry) => rows.push({
            date: entry.createdAt,
            module: entry.title,
            result: entry.result
        }));

        rows.sort((a, b) => new Date(b.date) - new Date(a.date));
        const tableBody = document.getElementById("analyticsActivityRows");
        tableBody.replaceChildren();

        if (!rows.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 3;
            cell.textContent = "No activities yet. Use a farming tool to generate analytics.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        rows.slice(0, 12).forEach((entry) => {
            const row = document.createElement("tr");
            [formatDate(entry.date), entry.module, entry.result].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    }

    function chartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: "#0f172a", padding: 10 }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: "#64748b", font: { family: "Manrope", size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: "#94a3b8", font: { family: "Manrope", size: 11 } },
                    grid: { color: "#eef2f7" },
                    border: { display: false }
                }
            }
        };
    }

    function getField(answer, fieldName) {
        const line = String(answer || "").split(/\r?\n/)
            .find((value) => value.startsWith(fieldName));
        return line ? line.slice(fieldName.length).trim() : "Not available";
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Recently";
        return date.toLocaleString([], {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    }
})();
