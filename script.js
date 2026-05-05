const API_KEY="YOUR_API_KEY";
let currentLang="en";

// 🌍 translations
const t={
en:{title:"RainScape",check:"Check Weather",safe:"Safe",risk:"High Risk",chat:"Ask weather"},
hi:{title:"रेनस्केप",check:"मौसम",safe:"सुरक्षित",risk:"खतरा",chat:"पूछें"}
};

// LOGIN
function sendOTP(){ alert("OTP=1234"); }
function login(){
 if(otp.value==="1234"){
  loginPage.style.display="none";
  app.style.display="block";
 }
}

// LANG
function changeLang(){
 currentLang=language.value;
 title.innerText=t[currentLang]?.title||t.en.title;
 heading.innerText=t[currentLang]?.check||t.en.check;
}

// WEATHER
async function checkWeather(){
 loader.style.display="block";
 weather.innerHTML="";

 let city=locationInput.value;

 let res=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
 let data=await res.json();

 loader.style.display="none";

 let temp=data.main.temp;
 let condition=data.weather[0].main.toLowerCase();

 weather.innerHTML=`${temp}°C ${condition}`;

 applyEffects(condition);

 if(condition.includes("rain")){
  alertBox.innerText=t[currentLang].risk;
  riskBar.style.width="90%";
 } else{
  alertBox.innerText=t[currentLang].safe;
  riskBar.style.width="30%";
 }

 updateMap();
}

// 🌧️ EFFECTS
function applyEffects(c){
 if(c.includes("rain")){
  rainEffect.style.opacity=0.2;
  navigator.vibrate?.(200);
 } else{
  rainEffect.style.opacity=0;
 }
}

// 📍 LOCATION
function getLocation(){
 navigator.geolocation.getCurrentPosition(pos=>{
  map.setView([pos.coords.latitude,pos.coords.longitude],12);
 });
}

// 🎤 VOICE
function startVoice(){
 let rec=new webkitSpeechRecognition();
 rec.onresult=e=>{
  locationInput.value=e.results[0][0].transcript;
 };
 rec.start();
}

// 🤖 CHAT
function toggleChat(){
 chatWindow.classList.toggle("hidden");
}
function sendMessage(){
 chatbox.innerHTML+=`<div>Bot: ${t[currentLang].chat}</div>`;
}

// 🗺️ MAP
let map=L.map('map').setView([28.6,77.2],10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function updateMap(){
 L.marker([28.6,77.2]).addTo(map);
}
