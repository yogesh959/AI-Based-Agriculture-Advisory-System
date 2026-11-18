(function () {
    "use strict";

    const STORAGE_KEY = "agrivision_activity_log";

    function readActivities() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch (_error) {
            return [];
        }
    }

    function recordActivity(activity) {
        if (!activity || !activity.type || !activity.title) return;

        const activities = readActivities();
        activities.unshift({
            type: String(activity.type),
            title: String(activity.title),
            result: String(activity.result || "Completed"),
            createdAt: activity.createdAt || new Date().toISOString()
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, 50)));
    }

    window.AgriActivityLog = {
        read: readActivities,
        record: recordActivity
    };
})();
