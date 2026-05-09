/* ═══════════════════════════════════════
   weather.js — Weather checking, forecast,
   voice input, geolocation
════════════════════════════════════════ */

const OWM_KEY = 'bd5e378503941ddeb2130bba7dc0b700';

const WEATHER_ICONS = {
  Clear:'☀️', Clouds:'⛅', Rain:'🌧️', Drizzle:'🌦️',
  Thunderstorm:'⛈️', Snow:'❄️', Mist:'🌫️', Fog:'🌫️',
  Haze:'🌫️', Smoke:'💨', Dust:'🌪️', Tornado:'🌪️'
};

const WEATHER_TIPS = {
  Rain:        '☂️ Carry an umbrella! Roads may be slippery — drive carefully.',
  Drizzle:     '🌂 Light drizzle — a jacket should keep you dry!',
  Thunderstorm:'⚡ Stay indoors! Thunderstorm warning — avoid open areas.',
  Clear:       '😎 Beautiful clear skies — perfect to go outside!',
  Clouds:      '🌤️ Overcast but pleasant — good to step out.',
  Snow:        '🧥 Bundle up — icy roads ahead, drive slow.',
  Haze:        '😷 Hazy air quality — consider wearing a mask.',
  Mist:        '🚗 Low visibility — use fog lights and slow down.',
  Fog:         '🚗 Dense fog — avoid driving if possible.',
  Smoke:       '😷 Smoky air — stay indoors and keep windows shut.',
  default:     '🌈 Stay weather-aware and check back for updates!',
};

let currentWeatherData = null;

async function checkWeather() {
  const city = (document.getElementById('cityInput')?.value || '').trim();
  if (!city) { setWeatherAlert('⚠️ Please enter a city name', 'warn'); return; }

  const btn = document.getElementById('checkWeatherBtn');
  if (btn) { btn.textContent = '⏳ Checking...'; btn.disabled = true; }

  try {
    // Current weather
    const r1 = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric`
    );
    const d = await r1.json();
    if (d.cod !== 200) throw new Error(d.message || 'City not found');

    currentWeatherData = d;
    renderCurrentWeather(d);

    // 5-day forecast
    const r2 = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric`
    );
    const fd = await r2.json();
    if (fd.cod === '200' || fd.list) renderForecast(fd.list);

    // Fly map
    if (window.mainMap) {
      window.mainMap.flyTo([d.coord.lat, d.coord.lon], 12, { animate: true, duration: 1.5 });
      L.marker([d.coord.lat, d.coord.lon])
       .addTo(window.mainMap)
       .bindPopup(`<b>${d.name}, ${d.sys.country}</b><br>${Math.round(d.main.temp)}°C · ${d.weather[0].description}`)
       .openPopup();
    }

    // Ticker
    const ticker = document.getElementById('tickerText');
    if (ticker) ticker.textContent =
      `📍 ${d.name}, ${d.sys.country} — ${Math.round(d.main.temp)}°C · ${d.weather[0].description} · Humidity ${d.main.humidity}%`;

    // Update safety badge
    updateSafetyBadge(d);

    setWeatherAlert(`✅ Weather loaded for ${d.name}, ${d.sys.country}`, 'ok');
    setTimeout(() => setWeatherAlert('', ''), 3500);

  } catch (e) {
    setWeatherAlert(`❌ ${e.message}`, 'err');
  } finally {
    if (btn) { btn.textContent = '🔍 Check Weather'; btn.disabled = false; }
  }
}

function renderCurrentWeather(d) {
  const cond = d.weather[0].main;
  const icon = WEATHER_ICONS[cond] || '🌡️';
  const temp = Math.round(d.main.temp);
  const feels= Math.round(d.main.feels_like);
  const desc = d.weather[0].description;

  const box = document.getElementById('weatherResult');
  if (box) {
    box.classList.remove('hidden');
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:2.8rem">${icon}</span>
        <div>
          <div class="weather-temp">${temp}°C</div>
          <div class="weather-desc">${desc} · Feels ${feels}°C</div>
        </div>
      </div>
      <div class="weather-sub">
        <span>💧 ${d.main.humidity}%</span>
        <span>💨 ${d.wind.speed} m/s</span>
        <span>🌡️ ${Math.round(d.main.temp_min)}–${Math.round(d.main.temp_max)}°C</span>
        <span>👁️ ${(d.visibility/1000).toFixed(1)} km</span>
      </div>`;
  }

  // lottie slot → emoji
  const ls = document.getElementById('lottieWeather');
  if (ls) ls.innerHTML = `<span style="font-size:3.5rem;filter:drop-shadow(0 0 14px rgba(56,189,248,.7))">${icon}</span>`;

  // risk bar
  const isRain = ['Rain','Drizzle','Thunderstorm'].includes(cond);
  const risk   = { Clear:15, Clouds:25, Drizzle:55, Rain:80, Thunderstorm:95, Snow:60, Fog:45, Mist:40, Haze:35 };
  const pct    = risk[cond] || 20;
  const bar    = document.getElementById('riskBar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = pct > 70 ? '#ef4444' : pct > 45 ? '#eab308' : '#22c55e';
  }

  // tip
  const tip = document.getElementById('weatherTip');
  if (tip) tip.textContent = WEATHER_TIPS[cond] || WEATHER_TIPS.default;

  // stats row
  setStatChip('statHumid', d.main.humidity + '%');
  setStatChip('statWind',  d.wind.speed + ' m/s');
  setStatChip('statVis',   (d.visibility/1000).toFixed(1) + ' km');
  setStatChip('statUV',    '—'); // UV not in free tier current weather

  // rain effect
  if (isRain) window.showRain && window.showRain();
  else         window.hideRain && window.hideRain();

  if (!isRain) {
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.65 } });
  }
}

function renderForecast(list) {
  if (!list) return;
  const strip = document.getElementById('forecastStrip');
  if (!strip) return;

  // One entry per day (noon)
  const days = {};
  list.forEach(item => {
    const d   = new Date(item.dt * 1000);
    const key = d.toDateString();
    if (!days[key]) days[key] = item;
  });

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  strip.innerHTML = '';
  Object.values(days).slice(0, 5).forEach(item => {
    const d    = new Date(item.dt * 1000);
    const icon = WEATHER_ICONS[item.weather[0].main] || '🌡️';
    const rain = item.pop ? Math.round(item.pop * 100) : 0;
    strip.innerHTML += `
      <div class="fc-day">
        <div class="fc-name">${dayNames[d.getDay()]}</div>
        <div class="fc-icon">${icon}</div>
        <div class="fc-temp">${Math.round(item.main.temp)}°C</div>
        <div class="fc-rain">🌧️${rain}%</div>
      </div>`;
  });
}

function setStatChip(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.querySelector('span').textContent = val;
}

function setWeatherAlert(msg, type) {
  const el = document.getElementById('weatherAlert');
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'err' ? '#f87171' : type === 'ok' ? '#4ade80' : '#fbbf24';
}

function updateSafetyBadge(d) {
  const cond  = d.weather[0].main;
  const badge = document.getElementById('safetyBadge');
  const label = document.getElementById('safetyLabel');
  const safeMap = { Clear:95, Clouds:80, Drizzle:60, Mist:55, Haze:50,
                    Fog:45, Rain:30, Snow:40, Thunderstorm:10 };
  const pct = safeMap[cond] || 60;
  if (label) label.textContent = `${pct}% Safe`;
  if (badge) {
    badge.style.background = pct < 35 ? 'rgba(239,68,68,.15)'
                           : pct < 60 ? 'rgba(234,179,8,.15)'
                           : 'rgba(34,197,94,.12)';
    badge.style.borderColor = pct < 35 ? 'rgba(239,68,68,.4)'
                            : pct < 60 ? 'rgba(234,179,8,.4)'
                            : 'rgba(34,197,94,.3)';
    badge.style.color = pct < 35 ? '#f87171' : pct < 60 ? '#fbbf24' : '#4ade80';
    const dot = badge.querySelector('.safety-dot');
    if (dot) dot.style.background = pct < 35 ? '#ef4444' : pct < 60 ? '#eab308' : '#22c55e';
  }
}

// ── VOICE ──
window.startVoice = function() {
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechAPI) { alert('Voice recognition not supported in this browser.'); return; }
  const rec = new SpeechAPI();
  rec.lang = 'en-US';
  rec.start();
  const btn = document.querySelector('.icon-btn[title="Voice"]');
  if (btn) btn.textContent = '🔴';
  rec.onresult = e => {
    const city = e.results[0][0].transcript;
    const inp  = document.getElementById('cityInput');
    if (inp) inp.value = city;
    if (btn) btn.textContent = '🎤';
    checkWeather();
  };
  rec.onerror = () => { if (btn) btn.textContent = '🎤'; };
};

// ── GPS ──
window.getMyLocation = function() {
  navigator.geolocation.getCurrentPosition(
    async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      if (window.mainMap) {
        window.mainMap.flyTo([lat, lon], 14);
        L.marker([lat, lon]).addTo(window.mainMap).bindPopup('📍 You are here').openPopup();
      }
      try {
        const r = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_KEY}`
        );
        const data = await r.json();
        if (data[0]) {
          const inp = document.getElementById('cityInput');
          if (inp) inp.value = data[0].name;
          checkWeather();
        }
      } catch(_) {}
    },
    () => alert('Location access denied. Please allow location in browser settings.')
  );
};

// expose globally
window.checkWeather = checkWeather;
