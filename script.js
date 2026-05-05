const API_KEY = "YOUR_API_KEY";

// Mode toggle
function toggleMode() {
  document.body.classList.toggle("light-mode");
}

// Language
function changeLang() {
  let lang = document.getElementById("language").value;
  document.querySelector("h1").innerText =
    lang === "hi" ? "🌧️ रेनस्केप" : "🌧️ RainScape";
}

// Weather
async function checkWeather() {
  let city = document.getElementById("locationInput").value;
  let loader = document.getElementById("loader");

  loader.style.display = "block";

  let res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  let data = await res.json();

  loader.style.display = "none";

  let temp = data.main.temp;
  let condition = data.weather[0].main.toLowerCase();

  document.getElementById("weather").innerHTML = `
    <div class="text-3xl font-bold">${temp}°C</div>
    <div class="capitalize">${condition}</div>
  `;

  let alertBox = document.getElementById("alertBox");
  let riskBar = document.getElementById("riskBar");

  let suggestion = "";

  if (condition.includes("rain")) {
    alertBox.innerHTML = "⚠️ High Waterlogging Risk";
    alertBox.style.background = "red";
    riskBar.style.width = "90%";
    riskBar.style.background = "red";
    suggestion = "Carry an umbrella ☔ and avoid flooded roads.";
  } else if (condition.includes("cloud")) {
    alertBox.innerHTML = "⚠️ Moderate Risk";
    alertBox.style.background = "orange";
    riskBar.style.width = "60%";
    riskBar.style.background = "orange";
    suggestion = "Weather is moderate, stay prepared.";
  } else {
    alertBox.innerHTML = "✅ Safe";
    alertBox.style.background = "green";
    riskBar.style.width = "30%";
    riskBar.style.background = "green";
    suggestion = "Great weather! Enjoy your day ☀️";
  }

  document.getElementById("suggestion").innerHTML = suggestion;

  updateMap(city);
}

// Map
let map = L.map('map').setView([28.6139, 77.2090], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function updateMap(city) {
  if (city.toLowerCase() === "delhi") {
    map.setView([28.6139, 77.2090], 12);
  }
}

// Geo
function getLocation() {
  navigator.geolocation.getCurrentPosition(() => {
    document.getElementById("locationInput").value = "Delhi";
  });
}

// Voice
function startVoice() {
  let rec = new webkitSpeechRecognition();
  rec.onresult = e => {
    document.getElementById("locationInput").value = e.results[0][0].transcript;
  };
  rec.start();
}

// Chat
function toggleChat() {
  document.getElementById("chatWindow").classList.toggle("hidden");
}

function sendMessage() {
  let input = document.getElementById("chatInput").value.toLowerCase();
  let chatbox = document.getElementById("chatbox");

  chatbox.innerHTML += `<div>You: ${input}</div>`;

  let reply = "Ask about weather!";
  if (input.includes("rain")) reply = "🌧️ Rain alert!";
  if (input.includes("safe")) reply = "✅ Safe conditions";

  chatbox.innerHTML += `<div>Bot: ${reply}</div>`;
}
