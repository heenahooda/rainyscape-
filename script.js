// ============================================================
//  RainScape Pro — CLEAN FIXED VERSION
// ============================================================

const API_KEY = "423dd9118fa369878f3a7cc98796ee80";

// ---- Suggestions ----
const suggestions = {
    rain: ["☂️ Carry an umbrella today!", "🌧️ Stay indoors if possible."],
    clear: ["😎 Great day outside!", "🌤️ Perfect for a walk!"],
    cloud: ["🌥️ Keep a jacket.", "☁️ Mild weather today."],
    snow: ["🧣 Dress warmly!", "❄️ Watch icy roads."]
};

// ---- Map ----
let map = L.map('map').setView([28.6139, 77.2090], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// ============================================================
// 🌦️ WEATHER FUNCTION
// ============================================================

async function checkWeather() {
    const city = document.getElementById('locationInput').value.trim();
    if (!city) return showAlert("⚠️ Enter city name", "orange");

    const btn = document.getElementById('checkBtn');
    btn.innerText = "Loading...";
    btn.disabled = true;

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await res.json();

        if (data.cod !== 200) {
            showAlert("❌ " + data.message, "red");
            return;
        }

        const temp = Math.round(data.main.temp);
        const cond = data.weather[0].main;
        const desc = data.weather[0].description;

        // 🌈 LOTTIE
        const lottieMap = {
            Rain: "https://assets10.lottiefiles.com/packages/lf20_jmBauI.json",
            Clear: "https://assets10.lottiefiles.com/packages/lf20_Stt1R8.json",
            Clouds: "https://assets10.lottiefiles.com/packages/lf20_0mOwU7.json"
        };

        const container = document.getElementById("lottie-weather");

        if (container) {
            container.innerHTML = "";
            lottie.loadAnimation({
                container: container,
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: lottieMap[cond] || lottieMap["Clouds"]
            });
        }

        // UI update
        document.getElementById('weather').innerHTML = `
            <div style="font-size:2rem">${temp}°C</div>
            <div>${desc}</div>
        `;

        map.flyTo([data.coord.lat, data.coord.lon], 12);
        L.marker([data.coord.lat, data.coord.lon]).addTo(map);

        showAlert("✅ Weather updated!", "green");

    } catch (err) {
        showAlert("❌ Network error", "red");
    }

    btn.innerText = "Check";
    btn.disabled = false;
}

// ============================================================
// 🚨 ALERT
// ============================================================

function showAlert(msg, color) {
    const box = document.getElementById('alertBox');
    box.innerText = msg;
    box.style.color = color;
}

// ============================================================
// 🎤 VOICE INPUT
// ============================================================

function startVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Speech) {
        alert("Voice not supported");
        return;
    }

    const rec = new Speech();
    rec.start();

    rec.onresult = (e) => {
        document.getElementById('locationInput').value =
            e.results[0][0].transcript;
        checkWeather();
    };
}

// ============================================================
// 💬 CHATBOT
// ============================================================

const botReplies = [
    "🌧️ Check heatmap for flood zones.",
    "☂️ Carry umbrella.",
    "📍 Use GPS for weather.",
    "🛡️ Stay safe in heavy rain.",
    "⚡ Thunderstorm? Stay indoors.",
    "🌡️ Stay hydrated!"
];

function sendMessage() {
    const input = document.getElementById('chatInput');
    const box = document.getElementById('chatbox');

    const userMsg = input.value.trim();
    if (!userMsg) return;

    box.innerHTML += `<div>🧑 ${userMsg}</div>`;
    input.value = "";

    let reply = botReplies[Math.floor(Math.random() * botReplies.length)];

    typeReply(reply);
}

function typeReply(text) {
    const box = document.getElementById('chatbox');

    let i = 0;
    let div = document.createElement("div");
    box.appendChild(div);

    let interval = setInterval(() => {
        div.innerHTML = "🤖 " + text.substring(0, i);
        i++;
        if (i > text.length) clearInterval(interval);
    }, 20);
}

// ============================================================
// 🔐 LOGIN SYSTEM
// ============================================================

function sendOTP() {
    alert("OTP: 1234");
    document.getElementById('otpSection').classList.add('show');
}

function login() {
    const otp = document.getElementById('otp').value;

    if (otp === "1234") {
        document.getElementById('loginPage').style.display = "none";
        document.getElementById('app').classList.remove('hidden');

        setTimeout(() => {
            map.invalidateSize();
        }, 500);
    } else {
        alert("Wrong OTP");
    }
}

// ============================================================
// ⌨️ ENTER KEY SUPPORT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('locationInput')
        ?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkWeather();
        });

    document.getElementById('chatInput')
        ?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
});
