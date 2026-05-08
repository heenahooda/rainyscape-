function switchDisasterMode(mode) {

    document.querySelectorAll(".disaster-mode")
        .forEach(el => {
            el.classList.remove("active");
        });

    document.querySelectorAll(".d-tab")
        .forEach(el => {
            el.classList.remove("active");
        });

    if (mode === "heatmap") {
        document.getElementById("disasterHeatmap")
            .classList.add("active");

        document.getElementById("heatmapTab")
            .classList.add("active");
    }

    if (mode === "report") {
        document.getElementById("disasterReport")
            .classList.add("active");

        document.getElementById("reportTab")
            .classList.add("active");
    }

    if (mode === "radar") {
        document.getElementById("disasterRadar")
            .classList.add("active");

        document.getElementById("radarTab")
            .classList.add("active");
    }

    if (mode === "timeline") {
        document.getElementById("disasterTimeline")
            .classList.add("active");

        document.getElementById("timelineTab")
            .classList.add("active");
    }
}

function submitReport() {
    alert("📡 Report Submitted");
}
