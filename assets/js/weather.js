function checkWeather() {

    const city =
        document.getElementById("locationInput").value;

    if (!city) {
        alert("Enter city");
        return;
    }

    const result =
        document.getElementById("weatherResult");

    result.classList.remove("hidden");

    document.getElementById("weatherDisplay").innerHTML = `
        <div>🌧️ ${city}</div>
        <div>Temperature: 26°C</div>
        <div>Humidity: 82%</div>
        <div>Rain Chance: 78%</div>
    `;

    document.getElementById("alertBox")
        .innerHTML =
        "⚠️ Moderate flood risk detected";

    document.getElementById("alertBox")
        .className =
        "alert-box warning";

    document.getElementById("riskBar")
        .style.width = "70%";

    document.getElementById("riskBar")
        .style.background = "#fbbf24";

    document.getElementById("suggestion")
        .innerText =
        "Avoid low-lying roads after evening rainfall.";

    generateForecast();
}

function generateForecast() {

    const hourly =
        document.getElementById("forecastHourly");

    hourly.innerHTML = "";

    for (let i = 0; i < 12; i++) {

        hourly.innerHTML += `
        <div class="forecast-hour-card">
            <div class="fc-time">${i + 1}:00</div>
            <div class="fc-icon">🌧️</div>
            <div class="fc-temp">${24 + i % 3}°</div>
            <div class="fc-rain">${40 + i}%</div>
        </div>
        `;
    }
}
