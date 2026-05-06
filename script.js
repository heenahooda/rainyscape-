// ============================================================
//  RainScape Pro — script.js
//  All original features preserved + API key + improvements
// ============================================================

const API_KEY = "423dd9118fa369878f3a7cc98796ee80"; // Working OpenWeatherMap demo key

const translations = {
    en: { nav: "RainScape", head: "Check Weather", btn: "Check", report: "📡 Live Report", heat: "🔥 Flood Heatmap", bot: "How can I help?", safe: "Safe", risk: "Risk", chatH: "RainyBot 🤖" },
    hi: { nav: "रेनस्केप", head: "मौसम की जांच", btn: "जांचें", report: "📡 लाइव रिपोर्ट", heat: "🔥 फ्लड मैप", bot: "मैं क्या मदद कर सकता हूँ?", safe: "सुरक्षित", risk: "खतरा", chatH: "रेनीबॉट 🤖" },
    es: { nav: "RainScape", head: "Clima", btn: "Consultar", report: "📡 Informe", heat: "🔥 Mapa", bot: "¿En qué ayudo?", safe: "Seguro", risk: "Riesgo", chatH: "RainyBot 🤖" },
    fr: { nav: "RainScape", head: "Météo", btn: "Vérifier", report: "📡 Rapport", heat: "🔥 Carte", bot: "Comment aider?", safe: "Sûr", risk: "Risque", chatH: "RainyBot 🤖" },
    de: { nav: "RainScape", head: "Wetter", btn: "Prüfen", report: "📡 Bericht", heat: "🔥 Karte", bot: "Wie helfen?", safe: "Sicher", risk: "Risiko", chatH: "RainyBot 🤖" },
    zh: { nav: "雨景", head: "查询天气", btn: "查询", report: "📡 现场报告", heat: "🔥 洪水图", bot: "我能帮你吗？", safe: "安全", risk: "危险", chatH: "雨机器人 🤖" },
    ja: { nav: "レインスケープ", head: "天気チェック", btn: "チェック", report: "📡 ライブ報告", heat: "🔥 洪水マップ", bot: "何かお手伝い？", safe: "安全", risk: "危険", chatH: "レイニーボット 🤖" },
    ru: { nav: "RainScape", head: "Погода", btn: "Проверить", report: "📡 Отчет", heat: "🔥 Карта", bot: "Чем помочь?", safe: "Безопасно", risk: "Риск", chatH: "РейниБот 🤖" },
    ar: { nav: "رينسكيب", head: "تحقق من الطقس", btn: "تحقق", report: "📡 تقرير مباشر", heat: "🔥 خريطة فيضان", bot: "كيف أساعد؟", safe: "آمن", risk: "خطر", chatH: "ريني بوت 🤖" },
    pt: { nav: "RainScape", head: "Clima", btn: "Verificar", report: "📡 Relatório", heat: "🔥 Mapa", bot: "Como ajudar?", safe: "Seguro", risk: "Risco", chatH: "RainyBot 🤖" }
};

// Suggestions based on weather
const suggestions = {
    rain:  ["☂️ Carry an umbrella today!", "🌧️ Stay indoors if possible.", "🚗 Drive carefully — wet roads ahead!"],
    clear: ["😎 Great day to go outside!", "🌤️ Perfect weather for a walk.", "🌈 Enjoy the sunshine today!"],
    cloud: ["🌥️ Might get cloudy — keep a jacket.", "☁️ Mild weather today.", "📚 A good day for indoor activities."],
    snow:  ["🧣 Dress warmly — it's cold!", "❄️ Watch out for icy roads.", "☃️ Bundle up today!"]
};

let map = L.map('map', { zoomControl: true }).setView([28.6139, 77.2090], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let heatmapActive = false;
let heatCircles = [];

// ---- Language ----
function changeLang() {
    const l = document.getElementById('language').value;
    const t = translations[l];
    document.getElementById('navTitle').innerText = t.nav;
    document.getElementById('heading').innerText = t.head;
    document.getElementById('checkBtn').innerText = t.btn;
    document.getElementById('reportBtn').innerText = t.report;
    document.getElementById('heatBtn').innerText = t.heat;
    document.getElementById('chatHeader').innerText = t.chatH;
    document.getElementById('chatInput').placeholder = t.bot;
}

// ---- Weather Check ----
async function checkWeather() {
    const city = document.getElementById('locationInput').value.trim();
    if (!city) return showAlert("⚠️ Please enter a city name.", "orange");

    const btn = document.getElementById('checkBtn');
    btn.innerText = "Loading...";
    btn.disabled = true;

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();

       if (data.cod !== 200) {
    showAlert(`❌ ${data.message}`, "red"); 
            btn.innerText = "Check"; btn.disabled = false;
            return;
        }

        const temp  = Math.round(data.main.temp);
        const feels = Math.round(data.main.feels_like);
        const hum   = data.main.humidity;
        const cond = data.weather[0].main;

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
        const desc  = data.weather[0].description;
        const wind  = data.wind.speed;

        // Weather emoji
        const iconMap = { Rain:'🌧️', Drizzle:'🌦️', Thunderstorm:'⛈️', Snow:'❄️', Clear:'☀️', Clouds:'⛅', Mist:'🌫️', Haze:'🌫️', Fog:'🌫️' };
        const icon = iconMap[cond] || '🌡️';

        document.getElementById('weather').innerHTML = `
            <div style="font-size:2.5rem">${icon}</div>
            <div style="font-size:2rem;font-weight:800">${temp}°C</div>
            <div style="font-size:0.85rem;opacity:0.7;text-transform:capitalize">${desc}</div>
            <div style="display:flex;gap:12px;font-size:0.72rem;margin-top:6px;opacity:0.65">
              <span>💧 ${hum}%</span>
              <span>🌡️ Feels ${feels}°C</span>
              <span>💨 ${wind} m/s</span>
            </div>
        `;

        // Move map
        map.flyTo([data.coord.lat, data.coord.lon], 12);
      const customIcon = L.divIcon({
    className: "custom-marker",
    html: "💧",
    iconSize: [30, 30]
});

L.marker([data.coord.lat, data.coord.lon], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${city}</b><br>${temp}°C — ${desc}`)
            .openPopup();

        // Rain effect
        const isRain = ['Rain','Drizzle','Thunderstorm'].includes(cond);
        const isSnow = cond === 'Snow';

        document.getElementById('rainCanvas').style.opacity = isRain ? "1" : "0";
        document.getElementById('riskBar').style.width = isRain ? "90%" : isSnow ? "60%" : "20%";
        document.getElementById('riskBar').style.backgroundColor = isRain ? "#ef4444" : isSnow ? "#60a5fa" : "#10b981";

        // Safety tracker
        const safePercent = isRain ? 30 : isSnow ? 60 : 95;
        document.getElementById('safety-text').innerText = `${safePercent}% Safe`;
        document.getElementById('progress-circle') && (document.getElementById('progress-circle').style.color = isRain ? '#ef4444' : '#10b981');

        // Alert box
        if (isRain) {
            showAlert("⚠️ Rain detected! Flood risk is HIGH.", "red");
        } else if (isSnow) {
            showAlert("❄️ Snow alert! Be careful on roads.", "blue");
        } else {
            showAlert("✅ Weather looks good!", "green");
        }

        // Smart suggestion
        let suggKey = isRain ? 'rain' : isSnow ? 'snow' : (cond === 'Clear' ? 'clear' : 'cloud');
        const suggArr = suggestions[suggKey];
        document.getElementById('suggestion').innerText = suggArr[Math.floor(Math.random() * suggArr.length)];

        if (!isRain) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    } catch (e) {
        showAlert("❌ Network error. Please try again.", "red");
    }

    btn.innerText = "Check";
    btn.disabled = false;
}

function showAlert(msg, color) {
    const box = document.getElementById('alertBox');
    const colors = { red: '#fca5a5', green: '#6ee7b7', blue: '#93c5fd', orange: '#fcd34d' };
    box.style.color = colors[color] || '#fff';
    box.innerText = msg;
}

// ---- Voice Input ----
function startVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return alert("Your browser doesn't support voice input.");
    const rec = new Speech();
    rec.lang = 'en-US';
    rec.start();
    showAlert("🎤 Listening...", "blue");
    rec.onresult = (e) => {
        document.getElementById('locationInput').value = e.results[0][0].transcript;
        checkWeather();
    };
    rec.onerror = () => showAlert("🎤 Could not hear. Try again.", "orange");
}

// ---- Geolocation ----
function getLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(async (p) => {
        const lat = p.coords.latitude;
        const lon = p.coords.longitude;
        map.flyTo([lat, lon], 14);
        L.marker([lat, lon]).addTo(map).bindPopup("📍 You are here").openPopup();

        // Reverse geocode to get city name
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
            const data = await res.json();
            document.getElementById('locationInput').value = data.name;
            checkWeather();
        } catch(e) {
            showAlert("📍 Location set!", "green");
        }
    }, () => showAlert("❌ Location access denied.", "red"));
}

// ---- Chatbot ----
const botReplies = [
    "🌧️ Check the heatmap for flood zones in your area!",
    "☂️ Always carry an umbrella during monsoon season.",
    "📍 Use your GPS to get real-time local weather.",
    "🛡️ In heavy rain, avoid low-lying flood-prone areas.",
    "📡 Use Live Report to share rain info with your community!",
    "⚡ Thunderstorm? Stay indoors and unplug electronics.",
    "🌡️ High humidity can feel hotter — stay hydrated!"
];

function sendMessage() {
    const input = document.getElementById('chatInput');
    const box = document.getElementById('chatbox');

    const userMsg = input.value.trim();
    if (!userMsg) return;

    // Show user message
    box.innerHTML += `<div style="margin:4px 0;font-size:0.8rem">🧑 ${userMsg}</div>`;
    input.value = "";

    // Generate reply
    let reply;
    const lower = userMsg.toLowerCase();

    if (lower.includes('rain') || lower.includes('flood')) reply = botReplies[0];
    else if (lower.includes('umbrella') || lower.includes('tip')) reply = botReplies[1];
    else if (lower.includes('location') || lower.includes('gps')) reply = botReplies[2];
    else if (lower.includes('safe') || lower.includes('danger')) reply = botReplies[3];
    else if (lower.includes('report')) reply = botReplies[4];
    else if (lower.includes('thunder') || lower.includes('lightning')) reply = botReplies[5];
    else if (lower.includes('humid') || lower.includes('hot')) reply = botReplies[6];
    else reply = botReplies[Math.floor(Math.random() * botReplies.length)];

    // Typing effect
    typeReply(reply);
}

function typeReply(text) {
    const box = document.getElementById('chatbox');

    let i = 0;
    let div = document.createElement("div");
    div.style.fontSize = "0.8rem";
    div.style.color = "#94a3b8";
    box.appendChild(div);

    let interval = setInterval(() => {
        div.innerHTML = "🤖 " + text.substring(0, i);
        i++;
        if (i > text.length) clearInterval(interval);
        box.scrollTop = box.scrollHeight;
    }, 20);
}
}
    const userMsg = input.value;
    input.value = "";

    setTimeout(() => {
        // Simple keyword matching
        let reply = translations[l].bot;
        const lower = userMsg.toLowerCase();
        if (lower.includes('rain') || lower.includes('flood'))   reply = botReplies[0];
        else if (lower.includes('umbrella') || lower.includes('tip')) reply = botReplies[1];
        else if (lower.includes('location') || lower.includes('gps')) reply = botReplies[2];
        else if (lower.includes('safe') || lower.includes('danger'))  reply = botReplies[3];
        else if (lower.includes('report'))                            reply = botReplies[4];
        else if (lower.includes('thunder') || lower.includes('lightning')) reply = botReplies[5];
        else if (lower.includes('humid') || lower.includes('hot'))   reply = botReplies[6];
        else reply = botReplies[Math.floor(Math.random() * botReplies.length)];

        box.innerHTML += `<div style="margin:4px 0;font-size:0.8rem;color:#94a3b8">🤖 ${reply}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 600);
}

// ---- OTP & Login ----
function sendOTP() {
    const name = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();
    if (!name || !contact) return alert("Please fill in your name and email/phone first!");
    alert("OTP Sent! ✉️\n\nDemo OTP: 1234");
    document.getElementById('otpSection').classList.add('show');
}

function login() {
    const otp = document.getElementById('otp').value.trim();
    if (otp === "1234") {
        document.getElementById('loginPage').style.display = "none";
        document.getElementById('app').classList.remove('hidden');
        setTimeout(() => map.invalidateSize(), 500);
        animateRain();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } else {
        alert("❌ Wrong OTP! Try: 1234");
    }
}

// ---- Toggle Chat ----
function toggleChat() {
    document.getElementById('chatWindow').classList.toggle('hidden');
}

// ---- Live Report ----
function reportRain() {
    showAlert("📡 Report submitted! Syncing live data...", "blue");
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    alert("✅ Report sent! Thank you for contributing to the community.");
}

// ---- SOS ----
function triggerSOS() {
    const pos = map.getCenter();
    alert(`🚨 SOS SENT!\n\nCoordinates shared:\nLat: ${pos.lat.toFixed(4)}\nLng: ${pos.lng.toFixed(4)}\n\nEmergency services have been notified.`);
    document.getElementById('sos-fab') && document.getElementById('sos-fab').classList.add('pulse');
}

// ---- Heatmap ----
function toggleHeatmap() {
    if (heatmapActive) {
        heatCircles.forEach(c => map.removeLayer(c));
        heatCircles = [];
        heatmapActive = false;
        document.getElementById('heatBtn').style.background = 'rgba(239,68,68,0.2)';
    } else {
        const center = map.getCenter();
        const zones = [
            [center.lat + 0.02, center.lng - 0.01],
            [center.lat - 0.03, center.lng + 0.02],
            [center.lat + 0.01, center.lng + 0.03],
            [center.lat - 0.015, center.lng - 0.025],
            [center.lat + 0.04, center.lng + 0.01],
        ];
        zones.forEach(([lat, lng], i) => {
            const c = L.circle([lat, lng], {
                radius: 600 + i * 150,
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.2 + i * 0.04,
                weight: 1
            }).addTo(map).bindPopup(`⚠️ Flood Risk Zone ${i + 1}`);
            heatCircles.push(c);
        });
        heatmapActive = true;
        document.getElementById('heatBtn').style.background = 'rgba(239,68,68,0.5)';
    }
}

// ---- Rain Animation ----
const canvas = document.getElementById('rainCanvas');
const ctx    = canvas.getContext('2d');
let drops    = [];

function animateRain() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    if (drops.length === 0) {
        for (let i = 0; i < 120; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                s: Math.random() * 5 + 5,
                l: Math.random() * 8 + 8,
                o: Math.random() * 0.5 + 0.3
            });
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(d => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(174,194,224,${d.o})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.l);
        ctx.stroke();
        d.y += d.s;
        if (d.y > canvas.height) { d.y = -20; d.x = Math.random() * canvas.width; }
    });

    requestAnimationFrame(animateRain);
}

// Allow Enter key in location input
document.addEventListener('DOMContentLoaded', () => {
    const locInput = document.getElementById('locationInput');
    if (locInput) {
        locInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkWeather();
        });
    }
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drops = [];
});
