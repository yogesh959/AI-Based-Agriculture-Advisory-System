(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("loginForm");
        const emailField = document.getElementById("loginEmail");
        const loginStatus = document.getElementById("loginStatus");

        try {
            const profile = JSON.parse(localStorage.getItem("agrivision_profile") || "{}");
            if (profile.email) emailField.value = profile.email;
        } catch (_error) {
            // The form remains available when saved profile data is invalid.
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            localStorage.removeItem("agrivision_logged_out");
            loginStatus.textContent = "Continuing to your dashboard...";
            window.location.href = "index.html";
        });
    });
})();
