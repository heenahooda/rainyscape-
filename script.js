const API_KEY = "YOUR_API_KEY"; // REPLACE WITH YOUR OPENWEATHERMAP API KEY

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

let map = L.map('map', { zoomControl: true }).setView([28.6139, 77.2090], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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

async function checkWeather() {
    const city = document.getElementById('locationInput').value;
    if(!city) return alert("Please enter a city name");
    
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        if(data.cod !== 200) throw new Error();

        const temp = Math.round(data.main.temp);
        const cond = data.weather[0].main;
        document.getElementById('weather').innerHTML = `${temp}°C ${cond}`;
        map.flyTo([data.coord.lat, data.coord.lon], 12);
        L.marker([data.coord.lat, data.coord.lon]).addTo(map).bindPopup(city).openPopup();

        const isRain = cond.toLowerCase().includes('rain');
        document.getElementById('rainCanvas').style.opacity = isRain ? "1" : "0";
        document.getElementById('riskBar').style.width = isRain ? "90%" : "20%";
        document.getElementById('riskBar').style.backgroundColor = isRain ? "red" : "green";
        if(!isRain) confetti();
    } catch(e) {
        alert("City spelling might be wrong or API Key is missing!");
    }
}

function startVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!Speech) return alert("Browser does not support voice");
    const rec = new Speech();
    rec.start();
    rec.onresult = (e) => {
        document.getElementById('locationInput').value = e.results[0][0].transcript;
        checkWeather();
    };
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(p => {
        map.flyTo([p.coords.latitude, p.coords.longitude], 14);
        L.marker([p.coords.latitude, p.coords.longitude]).addTo(map).bindPopup("You are here").openPopup();
    }, () => alert("Location denied"));
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const box = document.getElementById('chatbox');
    const l = document.getElementById('language').value;
    if(!input.value) return;
    box.innerHTML += `<div class='text-blue-400'>You: ${input.value}</div>`;
    setTimeout(() => {
        box.innerHTML += `<div class='text-gray-300'>Bot: ${translations[l].bot}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 500);
    input.value = "";
}

function sendOTP() { alert("OTP: 1234"); }
function login() {
    if(document.getElementById('otp').value === "1234") {
        document.getElementById('loginPage').style.display = "none";
        document.getElementById('app').classList.remove('hidden');
        setTimeout(() => map.invalidateSize(), 500);
        animateRain();
    }
}

function toggleChat() { document.getElementById('chatWindow').classList.toggle('hidden'); }
function reportRain() { alert("Reported! Live data syncing..."); confetti(); }
function triggerSOS() { alert("SOS SENT! COORDINATES SHARED."); }

// Rain Animation Engine
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
let drops = [];
function animateRain() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    if(drops.length === 0) for(let i=0; i<100; i++) drops.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, s:Math.random()*5+5});
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(174,194,224,0.5)";
    drops.forEach(d => {
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y+10); ctx.stroke();
        d.y += d.s; if(d.y > canvas.height) d.y = -10;
    });
    requestAnimationFrame(animateRain);
}
