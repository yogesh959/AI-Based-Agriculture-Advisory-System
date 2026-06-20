document.getElementById("language").addEventListener("change", function(){

    let lang = this.value;

    /* CROP PAGE */

    if(document.getElementById("title")){

        if(lang==="Hindi"){

            document.getElementById("title").innerHTML =
            "फसल सलाहकार";

            document.getElementById("predictBtn").innerHTML =
            "फसल की भविष्यवाणी करें";
        }

        else if(lang==="Telugu"){

            document.getElementById("title").innerHTML =
            "పంట సలహాదారు";

            document.getElementById("predictBtn").innerHTML =
            "పంటను అంచనా వేయండి";
        }

        else{

            document.getElementById("title").innerHTML =
            "Crop Advisor";

            document.getElementById("predictBtn").innerHTML =
            "Predict Crop";
        }
    }

    /* DASHBOARD PAGE */

    if(document.getElementById("dashboardTitle")){

        if(lang==="Hindi")
            document.getElementById("dashboardTitle").innerHTML =
            "कृषि डैशबोर्ड";

        else if(lang==="Telugu")
            document.getElementById("dashboardTitle").innerHTML =
            "వ్యవసాయ డ్యాష్‌బోర్డ్";

        else
            document.getElementById("dashboardTitle").innerHTML =
            "Farm Dashboard";
    }

    /* DISEASE PAGE */

    if(document.getElementById("diseaseTitle")){

        if(lang==="Hindi")
            document.getElementById("diseaseTitle").innerHTML =
            "रोग पहचान";

        else if(lang==="Telugu")
            document.getElementById("diseaseTitle").innerHTML =
            "వ్యాధి గుర్తింపు";

        else
            document.getElementById("diseaseTitle").innerHTML =
            "Disease Scanner";
    }

    /* WEATHER PAGE */

    if(document.getElementById("weatherTitle")){

        if(lang==="Hindi")
            document.getElementById("weatherTitle").innerHTML =
            "मौसम केंद्र";

        else if(lang==="Telugu")
            document.getElementById("weatherTitle").innerHTML =
            "వాతావరణ కేంద్రం";

        else
            document.getElementById("weatherTitle").innerHTML =
            "Weather Center";
    }

    /* ANALYTICS PAGE */

    if(document.getElementById("analyticsTitle")){

        if(lang==="Hindi")
            document.getElementById("analyticsTitle").innerHTML =
            "फार्म विश्लेषण";

        else if(lang==="Telugu")
            document.getElementById("analyticsTitle").innerHTML =
            "వ్యవసాయ విశ్లేషణ";

        else
            document.getElementById("analyticsTitle").innerHTML =
            "Farm Analytics";
    }

    /* CHATBOT PAGE */

    if(document.getElementById("chatbotTitle")){

        if(lang==="Hindi")
            document.getElementById("chatbotTitle").innerHTML =
            "एआई सहायक";

        else if(lang==="Telugu")
            document.getElementById("chatbotTitle").innerHTML =
            "AI సహాయకుడు";

        else
            document.getElementById("chatbotTitle").innerHTML =
            "AI Assistant";
    }

});