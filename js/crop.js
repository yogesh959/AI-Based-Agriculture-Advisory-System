async function predictCrop(){


    let soil = document.getElementById("soil").value;

    let water = document.getElementById("water").value;

    let season = document.getElementById("season").value;

    let previous = document.getElementById("previous").value;

    let location = document.getElementById("location").value;



    let crop = "Rice 🌾";

    let emoji = "🌾";

    let confidence = 90;

    let reason = "";



    if(soil === "Black Soil" && water === "High"){

        crop = "Cotton";

        emoji = "🌱";

        confidence = 95;

        reason =
        "Black soil and good water availability are ideal conditions for cotton farming.";

    }


    else if(soil === "Clay Soil" && season === "Monsoon"){

        crop = "Rice";

        emoji = "🌾";

        confidence = 96;

        reason =
        "Clay soil retains water and monsoon conditions support rice cultivation.";

    }


    else if(soil === "Red Soil"){

        crop = "Maize";

        emoji = "🌽";

        confidence = 91;

        reason =
        "Red soil provides suitable conditions for maize production.";

    }


    else if(soil === "Sandy Soil"){

        crop = "Groundnut";

        emoji = "🥜";

        confidence = 88;

        reason =
        "Sandy soil drainage is suitable for groundnut cultivation.";

    }


    else if(soil === "Loamy Soil"){

        crop = "Wheat";

        emoji = "🌾";

        confidence = 93;

        reason =
        "Loamy soil contains balanced nutrients suitable for wheat.";

    }


    else{

        reason =
        "Recommendation generated using soil, season and water conditions.";

    }





    if(location.trim()===""){

        location="Your Farm";

    }





    document.getElementById("result").innerHTML = `



<div class="ai-header">

<span>
🤖
</span>

<h2>
AI Crop Recommendation
</h2>

</div>





<div class="crop-result">


<div class="crop-icon">

${emoji}

</div>


<div>


<h1>

${crop}

</h1>


<p class="badge">

Best Match

</p>


</div>


</div>







<div class="confidence">


<p>
AI Confidence
</p>


<div class="progress">

<div class="progress-fill" style="width:${confidence}%"></div>

</div>


<h3>

${confidence}%

</h3>


</div>







<div class="reason-box">


<h3>
💡 Why this crop?
</h3>


<p>

${reason}

</p>


<br>


<p>
📍 Location:
${location}
</p>


<p>
🌍 Soil:
${soil}
</p>


<p>
💧 Water:
${water}
</p>


<p>
🌦 Season:
${season}
</p>


</div>



`;

    const saveStatus = document.createElement("p");
    saveStatus.setAttribute("role", "status");
    saveStatus.textContent = "Saving recommendation to history...";
    document.getElementById("result").appendChild(saveStatus);

    try {
        const response = await fetch("http://localhost:5000/crop-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                soil,
                water,
                season,
                previousCrop: previous,
                location,
                crop,
                confidence,
                reason
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to save recommendation.");
        saveStatus.textContent = "Recommendation saved to Reports.";
    } catch (error) {
        console.error(error);
        saveStatus.textContent = "Recommendation shown, but it could not be saved to Reports.";
    }

}

document.addEventListener("DOMContentLoaded", loadCropHistory);

async function loadCropHistory() {
    const historyRows = document.getElementById("cropHistoryRows");
    if (!historyRows) return;

    try {
        const response = await fetch("http://localhost:5000/history?limit=50&type=crop");
        if (!response.ok) throw new Error("Crop history is unavailable.");

        const data = await response.json();
        historyRows.replaceChildren();

        if (!data.history.length) {
            addCropHistoryMessage(historyRows, "No crop recommendations have been saved yet.");
            return;
        }

        data.history.forEach((entry) => {
            const row = document.createElement("tr");
            const createdAt = new Date(entry.created_at);
            const crop = getRecommendationField(entry.answer, "Recommended crop:");
            const confidence = getRecommendationField(entry.answer, "Confidence:");

            [createdAt.toLocaleString(), crop, confidence, entry.question].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            historyRows.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        historyRows.replaceChildren();
        addCropHistoryMessage(historyRows, "Could not load crop history. Check the backend and database.");
    }
}

function getRecommendationField(answer, fieldName) {
    const line = String(answer || "").split(/\r?\n/).find((value) => value.startsWith(fieldName));
    return line ? line.slice(fieldName.length).trim() : "Not available";
}

function addCropHistoryMessage(tableBody, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = message;
    row.appendChild(cell);
    tableBody.appendChild(row);
}