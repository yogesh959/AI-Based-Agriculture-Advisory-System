document.addEventListener("DOMContentLoaded", function () {
    if (window.AgriActivityLog) {
        window.AgriActivityLog.record({
            type: "weather",
            title: "Weather check",
            result: "Rain chance 60%"
        });
    }
});
