(function () {
    "use strict";

    const API_URL = "http://localhost:5000";

    document.addEventListener("DOMContentLoaded", loadDashboardActivities);
    document.addEventListener("DOMContentLoaded", loadDashboardProfile);

    function loadDashboardProfile() {
        try {
            const profile = JSON.parse(localStorage.getItem("agrivision_profile") || "{}");
            const avatar = document.getElementById("dashboardProfileAvatar");
            const name = document.getElementById("dashboardProfileName");
            const email = document.getElementById("dashboardProfileEmail");
            if (localStorage.getItem("agrivision_logged_out") === "true") {
                if (avatar) avatar.textContent = "—";
                if (name) name.textContent = "Signed out";
                if (email) email.textContent = "Account inactive";
                return;
            }
            if (!profile.fullName) return;
            if (avatar) avatar.textContent = profile.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
            if (name) name.textContent = profile.fullName;
            if (email) email.textContent = profile.email || "AgriVision User";
            const welcome = document.getElementById("dashboardWelcomeName");
            if (welcome) {
                const firstName = profile.fullName.trim().split(/\s+/)[0];
                welcome.textContent = `Welcome back, ${firstName}`;
            }
        } catch (_error) {
            // Keep the default dashboard profile.
        }
    }

    async function loadDashboardActivities() {
        const tableBody = document.getElementById("dashboardActivityRows");
        if (!tableBody) return;

        const activities = [];
        const localActivities = window.AgriActivityLog
            ? window.AgriActivityLog.read()
            : [];

        localActivities.forEach((activity) => activities.push({
            date: activity.createdAt,
            title: activity.title,
            result: activity.result
        }));

        try {
            const [cropResponse, imageResponse] = await Promise.all([
                fetch(`${API_URL}/history?limit=50&type=crop`),
                fetch(`${API_URL}/history?limit=50&type=image`)
            ]);

            if (cropResponse.ok) {
                const cropData = await cropResponse.json();
                (cropData.history || []).forEach((entry) => {
                    activities.push({
                        date: entry.created_at,
                        title: "Crop prediction",
                        result: getField(entry.answer, "Recommended crop:")
                    });
                });
            }

            if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                (imageData.history || []).forEach((entry) => {
                    activities.push({
                        date: entry.created_at,
                        title: "Disease scan",
                        result: entry.image_name || "Image analysis completed"
                    });
                });
            }
        } catch (error) {
            console.warn("Backend activity history unavailable:", error);
        }

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        tableBody.replaceChildren();

        if (activities.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 3;
            cell.textContent = "No activities yet. Complete a farm analysis to see updates here.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        activities.slice(0, 10).forEach((activity) => {
            const row = document.createElement("tr");
            [formatDate(activity.date), activity.title, activity.result].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    }

    function getField(answer, fieldName) {
        const line = String(answer || "").split(/\r?\n/)
            .find((value) => value.startsWith(fieldName));
        return line ? line.slice(fieldName.length).trim() : "Analysis completed";
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Recently";
        return date.toLocaleString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }
})();
