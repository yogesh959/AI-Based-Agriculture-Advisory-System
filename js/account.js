(function () {
    "use strict";

    const PROFILE_KEY = "agrivision_profile";
    const SESSION_KEY = "agrivision_logged_out";
    const defaults = {
        fullName: "Yogesh Kumar",
        email: "yogesh@example.com",
        phone: "",
        location: "",
        farmName: ""
    };

    function loadProfile() {
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") };
        } catch (_error) {
            return { ...defaults };
        }
    }

    function getInitials(name) {
        return String(name || "")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "YK";
    }

    function renderProfile(profile) {
        document.getElementById("accountName").textContent = profile.fullName;
        document.getElementById("accountAvatar").textContent = getInitials(profile.fullName);
        document.getElementById("savedFullName").textContent = profile.fullName || "Not provided";
        document.getElementById("savedEmail").textContent = profile.email || "Not provided";
        document.getElementById("savedPhone").textContent = profile.phone || "Not provided";
        document.getElementById("savedLocation").textContent = profile.location || "Not provided";
        document.getElementById("savedFarmName").textContent = profile.farmName || "Not provided";
    }

    function setEditMode(isEditing) {
        document.getElementById("accountForm").hidden = !isEditing;
        document.getElementById("accountSavedDetails").hidden = isEditing;
        document.getElementById("accountEditButton").hidden = isEditing;
    }

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("accountForm");
        if (!form) return;

        const profile = loadProfile();
        const hasSavedProfile = Boolean(localStorage.getItem(PROFILE_KEY));
        Object.keys(defaults).forEach((key) => {
            const field = document.getElementById(key);
            if (field) field.value = profile[key] || "";
        });

        renderProfile(profile);
        setEditMode(!hasSavedProfile);
        document.getElementById("accountEditButton").addEventListener("click", function () {
            setEditMode(true);
            document.getElementById("fullName").focus();
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const updated = {
                fullName: document.getElementById("fullName").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim(),
                location: document.getElementById("location").value.trim(),
                farmName: document.getElementById("farmName").value.trim()
            };

            localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
            localStorage.removeItem(SESSION_KEY);
            renderProfile(updated);

            const status = document.getElementById("accountStatus");
            status.textContent = "Profile changes saved.";
            status.className = "account-status-success";
            setEditMode(false);

            if (window.AgriActivityLog) {
                window.AgriActivityLog.record({
                    type: "account",
                    title: "Account updated",
                    result: "Profile details saved"
                });
            }
        });

        document.getElementById("logoutButton").addEventListener("click", function () {
            const confirmed = window.confirm("Log out of AgriVision AI?");
            if (!confirmed) return;
            localStorage.setItem(SESSION_KEY, "true");
            window.location.href = "login.html";
        });
    });
})();
