const cropChart = new Chart(document.getElementById("cropChart"), {

    type: "bar",

    data: {
        labels: ["Rice", "Maize", "Cotton", "Sugarcane"],
        datasets: [{
            label: "Crop Recommendations",
            data: [40, 25, 20, 15],
            borderWidth: 1
        }]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "white"
                }
            },
            y: {
                ticks: {
                    color: "white"
                }
            }
        }
    }

});

const diseaseChart = new Chart(document.getElementById("diseaseChart"), {

    type: "doughnut",

    data: {
        labels: ["Healthy", "Early Blight", "Late Blight"],
        datasets: [{
            data: [60, 25, 15]
        }]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            }
        }
    }

});

document.addEventListener("agri-language-change", function (event) {
    const labels = {
        English: {
            cropDataset: "Crop Recommendations",
            crops: ["Rice", "Maize", "Cotton", "Sugarcane"],
            diseases: ["Healthy", "Early Blight", "Late Blight"]
        },
        Hindi: {
            cropDataset: "फसल सिफारिशें",
            crops: ["धान", "मक्का", "कपास", "गन्ना"],
            diseases: ["स्वस्थ", "अगेती झुलसा", "पछेती झुलसा"]
        },
        Telugu: {
            cropDataset: "పంట సిఫార్సులు",
            crops: ["వరి", "మొక్కజొన్న", "పత్తి", "చెరకు"],
            diseases: ["ఆరోగ్యకరం", "ఎర్లీ బ్లైట్", "లేట్ బ్లైట్"]
        }
    };
    const selectedLabels = labels[event.detail.language] || labels.English;

    cropChart.data.labels = selectedLabels.crops;
    cropChart.data.datasets[0].label = selectedLabels.cropDataset;
    diseaseChart.data.labels = selectedLabels.diseases;
    cropChart.update();
    diseaseChart.update();
});