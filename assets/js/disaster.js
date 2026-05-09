/* ═══════════════════════════════════════
   disaster.js — Disaster Intelligence
   Flood heatmap, community reports,
   rainfall monitor, crowd alerts
════════════════════════════════════════ */

let disasterMap     = null;
let disasterCircles = [];

// ── SIMULATED FLOOD HOTSPOTS (Delhi region as demo) ──
const FLOOD_ZONES = [
  { lat:28.700, lon:77.100, r:1200, color:'#ef4444', label:'Rohini — High Flood Risk',    level:'high' },
  { lat:28.640, lon:77.220, r:900,  color:'#eab308', label:'ITO — Waterlogging',          level:'med'  },
  { lat:28.570, lon:77.180, r:1000, color:'#ef4444', label:'Lajpat Nagar — Heavy Flood',  level:'high' },
  { lat:28.680, lon:77.350, r:700,  color:'#f97316', label:'Patparganj — Traffic+Water',  level:'med'  },
  { lat:28.740, lon:77.280, r:1500, color:'#ef4444', label:'Yamuna Floodplain — DANGER',  level:'high' },
  { lat:28.620, lon:77.070, r:600,  color:'#eab308', label:'Dwarka — Mild Waterlogging',  level:'low'  },
  { lat:28.550, lon:77.340, r:800,  color:'#22c55e', label:'Saket — Emergency Route OK',  level:'low'  },
];

const RAINFALL_DATA = {
  hours:   ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00'],
  values:  [12, 18, 35, 62, 88, 74, 55, 40],
  colors:  ['#3b82f6','#3b82f6','#eab308','#ef4444','#ef4444','#ef4444','#eab308','#eab308'],
};

const COMMUNITY_REPORTS_SEED = [
  { user:'Priya S.',    loc:'Connaught Place', text:'2 feet water on main road, cars stuck!',      sev:'high',  time:'2 min ago'  },
  { user:'Rohit M.',   loc:'Karol Bagh',       text:'Underpass flooded, avoid MB Road completely', sev:'high',  time:'7 min ago'  },
  { user:'Anjali T.',  loc:'Lajpat Nagar',     text:'Light waterlogging near metro station',       sev:'medium',time:'15 min ago' },
  { user:'Siddharth K.',loc:'Noida Sec 18',    text:'Traffic jam due to waterlogging near mall',   sev:'medium',time:'22 min ago' },
  { user:'Meera J.',   loc:'Saket',            text:'Roads clear after pumping, safe to drive',    sev:'low',   time:'28 min ago' },
  { user:'Arjun P.',   loc:'Yamuna Bank',      text:'DANGER: Yamuna water level rising fast!',     sev:'high',  time:'35 min ago' },
];

const SAFETY_RECS = [
  { icon:'🏠', text:'Stay indoors if rainfall exceeds 50 mm/hour in your area.' },
  { icon:'🚗', text:'Avoid low-lying underpasses and subways during heavy rain.' },
  { icon:'📱', text:'Keep phone charged and share your live location with family.' },
  { icon:'🆘', text:'Call 112 immediately if you witness any person in flood water.' },
  { icon:'🧰', text:'Keep an emergency kit: torch, water, first aid, and dry food.' },
  { icon:'🗺️', text:'Use RainScape Smart Routes to find flood-free paths in real time.' },
];

const CROWD_ALERTS = [
  { loc:'Yamuna Expressway',  type:'Road Closure',    level:'high' },
  { loc:'Ring Road – Ashram', type:'Heavy Flooding',  level:'high' },
  { loc:'NH-48 near Gurgaon', type:'Traffic Jam',     level:'med'  },
  { loc:'Dwarka Expressway',  type:'Waterlogging',    level:'med'  },
  { loc:'Outer Ring Road',    type:'Safe to Drive',   level:'low'  },
  { loc:'South Delhi – Saket',type:'Clear Road',      level:'low'  },
];

// ── INIT DISASTER MAP ──
function initDisasterMap() {
  if (disasterMap) return;
  disasterMap = L.map('disasterHeatMap', { zoomControl: false, scrollWheelZoom: false })
    .setView([28.6139, 77.2090], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(disasterMap);
  window.disasterMap = disasterMap;
  drawFloodZones();
}

function drawFloodZones() {
  disasterCircles.forEach(c => c.remove());
  disasterCircles = [];
  FLOOD_ZONES.forEach(z => {
    const circle = L.circle([z.lat, z.lon], {
      radius: z.r, color: z.color, fillColor: z.color,
      fillOpacity: 0.35, weight: 2, opacity: 0.8,
    }).addTo(disasterMap).bindTooltip(z.label, { permanent: false });
    disasterCircles.push(circle);
  });
}

// ── RAINFALL CHART ──
function renderRainfallChart() {
  const barsEl   = document.getElementById('chartBars');
  const labelsEl = document.getElementById('chartLabels');
  if (!barsEl || !labelsEl) return;

  const max = Math.max(...RAINFALL_DATA.values);
  barsEl.innerHTML   = '';
  labelsEl.innerHTML = '';

  RAINFALL_DATA.values.forEach((v, i) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height     = '4px';
    bar.style.background = RAINFALL_DATA.colors[i];
    barsEl.appendChild(bar);
    // animate in
    setTimeout(() => { bar.style.height = Math.round((v / max) * 80) + 'px'; }, 100 + i * 80);

    const lbl = document.createElement('div');
    lbl.className   = 'chart-label';
    lbl.textContent = RAINFALL_DATA.hours[i];
    labelsEl.appendChild(lbl);
  });
}

// ── COMMUNITY FEED ──
let feedReports = [...COMMUNITY_REPORTS_SEED];

function renderCommunityFeed() {
  const feed = document.getElementById('communityFeed');
  if (!feed) return;
  feed.innerHTML = feedReports.slice(0, 8).map(r => `
    <div class="report-card">
      <div class="rc-meta">
        <span>👤 ${r.user} · 📍 ${r.loc}</span>
        <span>${r.time}</span>
      </div>
      <div class="rc-text">${r.text}</div>
      <div class="rc-sev sev-${r.sev}">
        ${r.sev === 'high' ? '🔴 SEVERE' : r.sev === 'medium' ? '🟡 MODERATE' : '🟢 MILD'}
      </div>
    </div>`).join('');
}

window.submitReport = function() {
  const inp = document.getElementById('reportInput');
  if (!inp || !inp.value.trim()) return;
  feedReports.unshift({
    user: 'You',
    loc:  'Your Location',
    text: inp.value.trim(),
    sev:  'medium',
    time: 'Just now',
  });
  inp.value = '';
  renderCommunityFeed();
  confetti({ particleCount: 60, spread: 50 });
};

// ── SAFETY RECS ──
function renderSafetyRecs() {
  const el = document.getElementById('safetyRecs');
  if (!el) return;
  el.innerHTML = SAFETY_RECS.map(r => `
    <div class="rec-item">
      <span class="rec-icon">${r.icon}</span>
      <span>${r.text}</span>
    </div>`).join('');
}

// ── CROWD ALERTS ──
function renderCrowdAlerts() {
  const el = document.getElementById('crowdAlerts');
  if (!el) return;
  el.innerHTML = CROWD_ALERTS.map(a => `
    <div class="alert-item">
      <div>
        <div class="alert-loc">${a.loc}</div>
        <div class="alert-type">${a.type}</div>
      </div>
      <span class="alert-level level-${a.level}">
        ${a.level === 'high' ? '🔴 DANGER' : a.level === 'med' ? '🟡 CAUTION' : '🟢 SAFE'}
      </span>
    </div>`).join('');
}

// ── LAYER TOGGLE ──
let activeLayer = 'flood';
window.toggleDisasterLayer = function(type) {
  activeLayer = type;
  document.querySelectorAll('.heatmap-controls .rs-btn-sm').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  if (type === 'flood')  { drawFloodZones(); }
  if (type === 'rain')   { drawRainfallOverlay(); }
  if (type === 'danger') { drawDangerOverlay(); }
};

function drawRainfallOverlay() {
  disasterCircles.forEach(c => c.remove());
  disasterCircles = [];
  FLOOD_ZONES.forEach(z => {
    const c = L.circle([z.lat, z.lon], {
      radius: z.r * 1.5, color: '#38bdf8', fillColor: '#38bdf8',
      fillOpacity: 0.22, weight: 1,
    }).addTo(disasterMap).bindTooltip('🌧️ Rainfall zone: ' + z.label);
    disasterCircles.push(c);
  });
}

function drawDangerOverlay() {
  disasterCircles.forEach(c => c.remove());
  disasterCircles = [];
  FLOOD_ZONES.filter(z => z.level === 'high').forEach(z => {
    const c = L.circle([z.lat, z.lon], {
      radius: z.r * 0.7, color: '#f97316', fillColor: '#f97316',
      fillOpacity: 0.45, weight: 2.5,
    }).addTo(disasterMap).bindTooltip('⚠️ DANGER ZONE: ' + z.label);
    disasterCircles.push(c);
  });
}

// ── INIT ALL ──
window.initDisasterTab = function() {
  setTimeout(() => {
    initDisasterMap();
    renderRainfallChart();
    renderCommunityFeed();
    renderSafetyRecs();
    renderCrowdAlerts();
    // live updates every 30s
    setInterval(() => {
      feedReports.unshift({
        user: ['Rahul V.','Neha K.','Vikram S.','Pooja M.'][Math.floor(Math.random()*4)],
        loc:  ['Hauz Khas','Janakpuri','Pitampura','Vasant Vihar'][Math.floor(Math.random()*4)],
        text: ['Heavy rain started suddenly.','Manhole open — danger!','Road clear now.','Water level rising.'][Math.floor(Math.random()*4)],
        sev:  ['low','medium','high'][Math.floor(Math.random()*3)],
        time: 'Just now',
      });
      renderCommunityFeed();
    }, 30000);
  }, 100);
};
