let selectedImage = null;
const AI_SERVER_URL = "http://localhost:5000";

function previewImage(event){

    selectedImage = event.target.files[0];

    if (!selectedImage) return;

    let image = document.getElementById("preview");
    let placeholder = document.getElementById("uploadPlaceholder");

    image.src = URL.createObjectURL(selectedImage);

    image.style.display = "block";
    if (placeholder) placeholder.style.display = "none";
}



async function analyzeImage(){


    if(!selectedImage){

        alert(window.translateForCurrentLanguage("Please upload a leaf image first"));

        return;

    }



    let resultBox = document.getElementById("analysisResult");


    resultBox.innerHTML = `
        <div class="disease-loading-state">
            <div class="disease-loader"></div>
            <h3>Analyzing leaf image</h3>
            <p>Checking visual patterns and plant health indicators...</p>
        </div>`;



    let formData = new FormData();

    formData.append("image", selectedImage);
    formData.append("source", "disease");
    formData.append("language", document.getElementById("language")?.value || "English");



    try{

        let healthResponse = await fetch(`${AI_SERVER_URL}/health`, {
            method: "GET"
        });

        if (!healthResponse.ok) {
            throw new Error("AI server is not responding. Start the backend and try again.");
        }

        let response = await fetch(`${AI_SERVER_URL}/analyze`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            let errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "AI server returned an error.");
        }



        let data = await response.json();



        const safeAnswer = String(data.answer || "No analysis returned.")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        resultBox.innerHTML = `
            <div class="disease-report">
                <div class="disease-report-status">
                    <span>ANALYSIS COMPLETE</span>
                    <strong>AI report</strong>
                </div>
                <p>${safeAnswer.replace(/\n/g,"<br>")}</p>
            </div>`;



        document.getElementById("treatment").innerHTML = `
            <div class="treatment-guidance">
                <div class="treatment-icon">✓</div>
                <div>
                    <h3>AI care guidance</h3>
                    <p>Review the treatment and prevention steps in the analysis report before applying any product.</p>
                </div>
            </div>`;



    }


    catch(error){


        console.log(error);


        resultBox.innerHTML = `

            <h2>❌ Error</h2>

            <p>${error.message || "Unable to connect with AI server."}</p>

            <br>

            <p>Start the backend by running <b>node server.js</b> in the backend folder.</p>

        `;


    }


}