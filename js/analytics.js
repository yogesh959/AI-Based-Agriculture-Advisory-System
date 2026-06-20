new Chart(document.getElementById("cropChart"), {

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

new Chart(document.getElementById("diseaseChart"), {

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