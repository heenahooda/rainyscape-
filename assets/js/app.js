// ===============================
// RAINYWAY MAIN APP LOGIC
// ===============================

let currentUser = "User";
let currentPage = "dashboard";

// ===============================
// LOGIN SYSTEM
// ===============================

function sendOTP() {
    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();

    if (!name || !contact) {
        alert("Please enter name and contact");
        return;
    }

    document.getElementById("otpSentMsg").innerText =
        `OTP sent to ${contact}`;

    goStep(2);

    startOtpTimer();
}

function verifyOTP() {
    const otp =
        document.getElementById("o1").value +
        document.getElementById("o2").value +
        document.getElementById("o3").value +
        document.getElementById("o4").value;

    if (otp === "1234") {

        document.getElementById("otpError").classList.add("hidden");

        goStep(3);

        startLoading();

    } else {
        document.getElementById("otpError").classList.remove("hidden");
    }
}

function goStep(step) {
    document.querySelectorAll(".form-step").forEach(el => {
        el.classList.remove("active");
    });

    document.getElementById(`step${step}`).classList.add("active");
}

function otpNav(current, nextId) {
    if (current.value.length === 1 && nextId) {
        document.getElementById(nextId).focus();
    }
}

function startOtpTimer() {

    let count = 30;

    const timer = setInterval(() => {

        document.getElementById("timerCount").innerText = count;

        count--;

        if (count < 0) {
            clearInterval(timer);
            document.getElementById("otpTimer").innerHTML =
                `<span style="color:#38bdf8">Resend OTP</span>`;
        }

    }, 1000);
}

function startLoading() {

    let progress = 0;

    const messages = [
        "Connecting to weather systems...",
        "Loading AI intelligence...",
        "Preparing flood analytics...",
        "Starting RainyWay..."
    ];

    let msgIndex = 0;

    const interval = setInterval(() => {

        progress += 5;

        document.getElementById("loadProgress").style.width =
            progress + "%";

        document.getElementById("loadMsg").innerText =
            messages[msgIndex % messages.length];

        msgIndex++;

        if (progress >= 100) {

            clearInterval(interval);

            launchApp();
        }

    }, 200);
}

function launchApp() {

    currentUser =
        document.getElementById("name").value || "User";

    document.getElementById("navUserName").innerText =
        currentUser;

    document.getElementById("loginPage").classList.add("hidden");

    document.getElementById("mainApp").classList.remove("hidden");

    initializeMaps();

    loadDefaultData();

    confetti({
        particleCount: 200,
        spread: 100
    });
}

// ===============================
// PAGE SWITCHING
// ===============================

function switchPage(page) {

    currentPage = page;

    document.querySelectorAll(".app-page").forEach(el => {
        el.classList.remove("active");
    });

    document.querySelectorAll(".nav-tab").forEach(el => {
        el.classList.remove("active");
    });

    document.getElementById(`page-${page}`).classList.add("active");

    document
        .querySelector(`[data-page="${page}"]`)
        .classList.add("active");
}

// ===============================
// CHATBOT
// ===============================

function toggleChat() {
    document.getElementById("chatWindow")
        .classList.toggle("hidden");
}

function sendMessage() {

    const input =
        document.getElementById("chatInput");

    const msg = input.value.trim();

    if (!msg) return;

    appendMessage(msg, "user");

    input.value = "";

    setTimeout(() => {

        let reply =
            "AI recommends safe travel before heavy rainfall.";

        if (msg.toLowerCase().includes("route")) {
            reply =
                "Route B is currently safest with low flood risk.";
        }

        if (msg.toLowerCase().includes("weather")) {
            reply =
                "Thunderstorm expected within 2 hours.";
        }

        appendMessage(reply, "bot");

    }, 800);
}

function appendMessage(text, type) {

    const box = document.getElementById("chatbox");

    const div = document.createElement("div");

    div.className = `chat-msg ${type}`;

    div.innerHTML = `
        <div class="chat-bubble">${text}</div>
    `;

    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
}

// ===============================
// MAPS
// ===============================

let map;
let routeMap;
let disasterMap;

function initializeMaps() {

    map = L.map("map").setView([28.6139, 77.2090], 11);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map);

    routeMap = L.map("routeMap").setView([28.6139, 77.2090], 11);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(routeMap);

    disasterMap = L.map("disasterMap").setView([28.6139, 77.2090], 11);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(disasterMap);
}

// ===============================
// LOCATION
// ===============================

function getLocation() {

    navigator.geolocation.getCurrentPosition((pos) => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        map.setView([lat, lon], 13);

        L.marker([lat, lon])
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();

    });
}

// ===============================
// UTILS
// ===============================

function socialLoginPlaceholder(name) {
    alert(`${name} login coming soon`);
}

function triggerSOS() {
    alert("🚨 SOS Alert Triggered");
}

function startVoice() {
    alert("Voice input activated");
}

function startVoiceChat() {
    alert("Voice chat activated");
}

function changeLang() {
    alert("Language changed");
}

function loadDefaultData() {

    document.getElementById("aiAlertText").innerText =
        "AI Warning: Heavy rainfall expected after 6 PM.";
}
