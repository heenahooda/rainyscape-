const API_KEY = "YOUR_API_KEY";
let currentLang = "en";

// 🌍 TRANSLATIONS (short for space)
const translations = {
  en:{title:"RainScape",check:"Check Weather",btn:"Check",high:"High Risk",safe:"Safe",chat:"Ask weather"},
  hi:{title:"रेनस्केप",check:"मौसम",btn:"जांचें",high:"खतरा",safe:"सुरक्षित",chat:"पूछें"},
  es:{title:"RainScape",check:"Clima",btn:"Buscar",high:"Riesgo",safe:"Seguro",chat:"Pregunta"},
  fr:{title:"RainScape",check:"Météo",btn:"Chercher",high:"Risque",safe:"Sûr",chat:"Demande"},
  de:{title:"RainScape",check:"Wetter",btn:"Suche",high:"Risiko",safe:"Sicher",chat:"Fragen"},
  zh:{title:"雨景",check:"天气",btn:"搜索",high:"风险",safe:"安全",chat:"询问"},
  ja:{title:"レイン",check:"天気",btn:"検索",high:"危険",safe:"安全",chat:"聞く"},
  ru:{title:"Рейн",check:"Погода",btn:"Поиск",high:"Риск",safe:"Безопасно",chat:"Спросить"},
  ar:{title:"رين",check:"الطقس",btn:"بحث",high:"خطر",safe:"آمن",chat:"اسأل"},
  pt:{title:"RainScape",check:"Clima",btn:"Buscar",high:"Risco",safe:"Seguro",chat:"Perguntar"}
};

// 🌸 LOGIN
function sendOTP(){ alert("OTP sent (demo = 1234)"); }
function login(){
  if(document.getElementById("otp").value==="1234"){
    document.getElementById("loginPage").style.display="none";
    document.getElementById("app").style.display="block";
  } else alert("Wrong OTP");
}

// 🌍 LANG
function changeLang(){
  currentLang=document.getElementById("language").value;
  let t=translations[currentLang];

  document.getElementById("title").innerText=t.title;
  document.getElementById("heading").innerText=t.check;
  document.getElementById("checkBtn").innerText=t.btn;
}

// 🌦️ WEATHER
async function checkWeather(){
  let city=document.getElementById("locationInput").value;
  let res=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
  let data=await res.json();

  let temp=data.main.temp;
  let condition=data.weather[0].main.toLowerCase();
  let t=translations[currentLang];

  document.getElementById("weather").innerHTML=`${temp}°C ${condition}`;

  if(condition.includes("rain")){
    document.getElementById("alertBox").innerText=t.high;
    document.getElementById("riskBar").style.width="90%";
  } else {
    document.getElementById("alertBox").innerText=t.safe;
    document.getElementById("riskBar").style.width="30%";
  }
}

// 🤖 CHAT
function toggleChat(){
  document.getElementById("chatWindow").classList.toggle("hidden");
}

function sendMessage(){
  let chat=document.getElementById("chatbox");
  let t=translations[currentLang];

  chat.innerHTML+=`<div>Bot: ${t.chat}</div>`;
}

// 🗺️ MAP
let map=L.map('map').setView([28.6,77.2],10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
