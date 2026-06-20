function previewImage(event){

    let image = document.getElementById("preview");

    image.src = URL.createObjectURL(event.target.files[0]);

    image.style.display = "block";
}

function analyzeImage(){

    document.getElementById("analysisResult").innerHTML = `
    
        <h1>🍅 Tomato Early Blight</h1>

        <br>

        <h3 class="severity-medium">
            Severity : Medium
        </h3>

        <br>

        <p>Confidence : 93%</p>

    `;

    document.getElementById("treatment").innerHTML = `
    
        <h3>Suggested Actions</h3>

        <br>

        <p>✅ Apply Mancozeb Fungicide</p>

        <p>✅ Remove infected leaves</p>

        <p>✅ Avoid excessive watering</p>

        <p>✅ Monitor every 7 days</p>

    `;
}