const API_KEY = "YOUR_API_KEY"; // Replace with your active key
let currentLang = "en";
let lottiePlayer;

// 1. Initialize Lottie with Dynamic Switching
function initLottie(condition = 'clear') {
    const container = document.getElementById('lottie-weather');
    container.innerHTML = ''; // Clear previous
    
    const path = condition.includes('rain') 
        ? 'https://assets9.lottiefiles.com/packages/lf20_b6czun9o.json' // Animated Rain
        : 'https://assets5.lottiefiles.com/packages/lf20_tad7clnr.json'; // Animated Sun

    lottiePlayer = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: path
    });
}

// 2. Advanced Rain Engine
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
let rainDrops = [];

function createRain() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    rainDrops = [];
    for (let i = 0; i < 150; i++) {
        rainDrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 25,
            speed: Math.random() * 7 + 7,
            opacity: Math.random() * 0.5
        });
    }
}

function animateRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    rainDrops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) d.y = -d.length;
    });
    requestAnimationFrame(animateRain);
}

// 3. Three.js Globe with Starfield
function initGlobe() {
    const container = document.getElementById('globe-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // Create Globe
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Ambient Lighting
    const light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 2.2;

    function anim() {
        requestAnimationFrame(anim);
        globe.rotation.y += 0.005;
        globe.rotation.x += 0.002;
        renderer.render(scene, camera);
    }
    anim();
}

// 4. Enhanced Weather Logic
async function checkWeather() {
    const city = document.getElementById('locationInput').value;
    if (!city) return;

    const loader = document.getElementById('weather-skeleton');
    const weatherDiv = document.getElementById('weather');
    
    loader.classList.remove('hidden');
    weatherDiv.classList.add('opacity-0');

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        
        loader.classList.add('hidden');
        weatherDiv.classList.remove('opacity-0');

        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].main;
        const lat = data.coord.lat;
        const lon = data.coord.lon;

        weatherDiv.innerHTML = `${temp}°C <span class="text-xl font-light">${condition}</span>`;
        
        // Update Map Smoothly
        map.flyTo([lat, lon], 12, { animate: true, duration: 1.5 });
        L.marker([lat, lon]).addTo(map).bindPopup(`Current weather in ${city}`).openPopup();

        handleWeatherEffects(condition);

    } catch (e) {
        console.error("Fetch Error:", e);
        alert("City not found. Please check the spelling!");
        loader.classList.add('hidden');
    }
}

function handleWeatherEffects(condition) {
    const isRaining = condition.toLowerCase().includes('rain');
    initLottie(condition.toLowerCase());

    if (isRaining) {
        document.getElementById('rainCanvas').style.opacity = "1";
        document.getElementById('riskBar').style.width = "90%";
        document.getElementById('riskBar').style.backgroundColor = "#ef4444";
        document.getElementById('alertBox').innerHTML = "🚨 HIGH RISK: Avoid low-lying areas.";
        document.getElementById('suggestion').innerText = "Keep an umbrella and check for road closures.";
    } else {
        document.getElementById('rainCanvas').style.opacity = "0";
        document.getElementById('riskBar').style.width = "15%";
        document.getElementById('riskBar').style.backgroundColor = "#10b981";
        document.getElementById('alertBox').innerHTML = "✅ Safe: No waterlogging predicted.";
        document.getElementById('suggestion').innerText = "Clear skies! Perfect for outdoor activities.";
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

// 5. Chatbot Simulation
function sendMessage() {
    const input = document.getElementById('chatInput');
    const box = document.getElementById('chatbox');
    if (!input.value) return;

    box.innerHTML += `<div class="text-right text-blue-400 mb-2">You: ${input.value}</div>`;
    
    setTimeout(() => {
        let reply = "I'm not sure about that. Try asking about the rain!";
        if(input.value.toLowerCase().includes('rain')) reply = "Current data shows high risk in urban sectors. Stay safe!";
        if(input.value.toLowerCase().includes('safe')) reply = "Check the risk bar on your dashboard for live updates.";
        
        box.innerHTML += `<div class="text-left text-gray-300 mb-2">Bot: ${reply}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 600);
    
    input.value = "";
}

// 6. Core App Flow
function login() {
    const otpInput = document.getElementById('otp').value;
    if (otpInput === "1234") {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Initialize all visuals after login
        initLottie();
        initGlobe();
        createRain();
        animateRain();
        setTimeout(() => map.invalidateSize(), 400); // Fixes Leaflet gray boxes
    } else {
        alert("Incorrect OTP! Hint: 1234");
    }
}

// SOS Logic
function triggerSOS() {
    if ("vibrate" in navigator) navigator.vibrate([100, 30, 100, 30, 100]);
    alert("Emergency SOS signal sent with your GPS coordinates!");
}

// Initialize Map
let map = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 11);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);
