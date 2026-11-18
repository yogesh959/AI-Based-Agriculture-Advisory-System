document.addEventListener("DOMContentLoaded", function () {

    const AI_SERVER_URL = "http://localhost:5000";
    const inputBox = document.getElementById("userInput");
    const chat = document.getElementById("chatBox");
    const form = document.getElementById("chatForm");
    const imageInput = document.getElementById("imageInput");
    const attachmentPreview = document.getElementById("attachmentPreview");
    const previewImage = document.getElementById("previewImage");
    const previewName = document.getElementById("previewName");
    const composerStatus = document.getElementById("composerStatus");
    const sendButton = document.getElementById("sendButton");
    const attachButton = document.getElementById("attachButton");
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (!inputBox || !chat || !form || !imageInput) {
        console.error("Missing required chat elements");
        return;
    }

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    let selectedImage = null;
    let previewUrl = null;

    function setStatus(message, isError = false) {
        composerStatus.textContent = message;
        composerStatus.classList.toggle("status-error", isError);
    }

    function clearSelectedImage() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = null;
        selectedImage = null;
        imageInput.value = "";
        attachmentPreview.hidden = true;
        previewImage.removeAttribute("src");
        setStatus("Photos: JPG, PNG, WebP, GIF up to 10 MB");
    }

    function appendMessage(text, type, imageFile = null) {
        const row = document.createElement("div");
        row.className = type === "bot" ? "message-row bot-row" : "message-row user-row";

        if (type === "bot") {
            const avatar = document.createElement("span");
            avatar.className = "message-avatar";
            avatar.textContent = "A";
            avatar.setAttribute("aria-hidden", "true");
            row.appendChild(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = `message ${type}`;

        if (text) {
            const copy = document.createElement("div");
            copy.className = "message-copy";
            copy.textContent = text;
            bubble.appendChild(copy);
        }

        if (imageFile) {
            const image = document.createElement("img");
            image.className = "message-image";
            image.src = URL.createObjectURL(imageFile);
            image.alt = `Uploaded photo: ${imageFile.name}`;
            bubble.appendChild(image);
        }

        row.appendChild(bubble);
        chat.appendChild(row);
        chat.scrollTop = chat.scrollHeight;
        return bubble;
    }

    window.sendMessage = async function () {
        const userInput = inputBox.value.trim();
        const imageFile = selectedImage;
        if (userInput === "" && !imageFile) return;

        const requestMessage = userInput || "Please analyze this crop photo and describe visible health issues and practical next steps.";
        if (welcomeMessage) welcomeMessage.hidden = true;
        appendMessage(userInput || "Please analyze this photo.", "user", imageFile);
        const botBubble = appendMessage(imageFile ? "Reviewing your photo..." : "Thinking...", "bot");

        inputBox.value = "";
        clearSelectedImage();
        sendButton.disabled = true;
        attachButton.disabled = true;

        try {
            let response;
            if (imageFile) {
                const payload = new FormData();
                payload.append("image", imageFile);
                payload.append("message", requestMessage);
                payload.append("language", document.getElementById("language")?.value || "English");
                payload.append("source", "assistant");
                response = await fetch(`${AI_SERVER_URL}/analyze`, {
                    method: "POST",
                    body: payload
                });
            } else {
                response = await fetch(`${AI_SERVER_URL}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: requestMessage,
                        language: document.getElementById("language")?.value || "English"
                    })
                });
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.answer || "The request could not be completed.");
            botBubble.querySelector(".message-copy").textContent = data.answer || "Sorry, I could not get an answer.";
        } catch (error) {
            console.error(error);
            botBubble.querySelector(".message-copy").textContent = error.message || "Could not reach the AI assistant. Check that the server is running and try again.";
        } finally {
            sendButton.disabled = false;
            attachButton.disabled = false;
            inputBox.focus();
            chat.scrollTop = chat.scrollHeight;
        }
    };

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        window.sendMessage();
    });

    attachButton.addEventListener("click", function () {
        imageInput.click();
    });

    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];
        if (!file) return;

        if (!allowedImageTypes.includes(file.type)) {
            clearSelectedImage();
            setStatus("Choose a JPG, PNG, WebP, or GIF image.", true);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            clearSelectedImage();
            setStatus("That image is larger than 10 MB.", true);
            return;
        }

        selectedImage = file;
        previewUrl = URL.createObjectURL(file);
        previewImage.src = previewUrl;
        previewName.textContent = file.name;
        attachmentPreview.hidden = false;
        setStatus("Photo ready to analyze");
    });

    document.getElementById("removeImage").addEventListener("click", clearSelectedImage);

    document.querySelectorAll(".suggestion").forEach(function (button) {
        button.addEventListener("click", function () {
            inputBox.value = button.dataset.prompt;
            window.sendMessage();
        });
    });

    inputBox.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            form.requestSubmit();
        }
    });

});