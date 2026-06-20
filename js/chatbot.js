document.addEventListener("DOMContentLoaded", function () {

    const inputBox = document.getElementById("userInput");
    const chat = document.getElementById("chatBox"); // ✅ matches expected structure

    if (!inputBox || !chat) {
        console.error("Missing chatBox or userInput");
        return;
    }

    window.sendMessage = function () {

        let userInput = inputBox.value.trim();
        if (userInput === "") return;

        // USER MESSAGE (matches CSS: message user)
        let userDiv = document.createElement("div");
        userDiv.className = "message user";
        userDiv.innerText = userInput;
        chat.appendChild(userDiv);

        // BOT MESSAGE (matches CSS: message bot)
        let botDiv = document.createElement("div");
        botDiv.className = "message bot";
        botDiv.innerText = "🤖 Thinking...";
        chat.appendChild(botDiv);

        inputBox.value = "";
        chat.scrollTop = chat.scrollHeight;

        setTimeout(() => {
            botDiv.innerText = getAIResponse(userInput.toLowerCase());
            chat.scrollTop = chat.scrollHeight;
        }, 800);
    };

    function getAIResponse(q) {

        if (q.includes("rice")) return "🌾 Rice grows in clay soil.";
        if (q.includes("cotton")) return "🌱 Cotton grows in black soil.";
        if (q.includes("fertilizer")) return "🧪 Use NPK fertilizer.";
        if (q.includes("irrigation")) return "💧 Irrigate morning/evening.";
        if (q.includes("rain")) return "☁ Check weather before irrigation.";
        if (q.includes("disease")) return "🍃 Use Disease Scanner.";
        if (q.includes("soil")) return "🌍 Soil testing is important.";
        if (q.includes("weather")) return "🌦 Monitor weather daily.";
        if (q.includes("hello") || q.includes("hi")) return "👨‍🌾 Hello Farmer!";

        return "🤖 I can help with crops, soil, irrigation, weather.";
    }

});