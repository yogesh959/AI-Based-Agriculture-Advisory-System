let selectedImage = null;
const AI_SERVER_URL = "http://localhost:5000";

function previewImage(event){

    selectedImage = event.target.files[0];

    let image = document.getElementById("preview");

    image.src = URL.createObjectURL(selectedImage);

    image.style.display = "block";
}



async function analyzeImage(){


    if(!selectedImage){

        alert(window.translateForCurrentLanguage("Please upload a leaf image first"));

        return;

    }



    let resultBox = document.getElementById("analysisResult");


    resultBox.innerHTML = `

        <h1>🤖 AI Analyzing...</h1>

        <p>Please wait while AI checks the leaf.</p>

    `;



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



        resultBox.innerHTML = `

            <h2>🌱 AI Disease Report</h2>

            <br>

            <p>${(data.answer || "No analysis returned.").replace(/\n/g,"<br>")}</p>

        `;



        document.getElementById("treatment").innerHTML = `

            <h3>🤖 AI Recommendation</h3>

            <br>

            <p>
            Follow the treatment and prevention steps
            mentioned in the AI report.
            </p>

        `;



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