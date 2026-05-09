/* ═══════════════════════════════════════
   routes.js — Smart Route Navigation System
   Color-coded flood/traffic route finder
════════════════════════════════════════ */

let selectedVehicle = 'car';
let routeMap        = null;
let routePolylines  = [];

// Route color scheme
const ROUTE_COLORS = {
  safe:       '#3b82f6',  // blue
  mild:       '#eab308',  // yellow waterlogging
  flood:      '#ef4444',  // red heavy flooding
  blocked:    '#111827',  // black
  traffic:    '#f97316',  // orange
  emergency:  '#22c55e',  // green
};

// Simulated route profiles for demo
const ROUTE_TEMPLATES = [
  {
    name: 'Route A — Recommended',
    best: true,
    status: 'safe',
    color: ROUTE_COLORS.safe,
    time: '22 min', dist: '8.4 km',
    traffic: 'Light', floodRisk: 'Low',
    waterlog: 'None', closure: 'No',
    vehicles: ['car','bike','bus','walk'],
    desc: 'Fastest route. Roads are clear and safe.',
    offsets: [[0.005,0.001],[0.012,0.008],[0.018,0.013],[0.022,0.02]],
  },
  {
    name: 'Route B — Mild Waterlogging',
    best: false,
    status: 'mild',
    color: ROUTE_COLORS.mild,
    time: '28 min', dist: '9.1 km',
    traffic: 'Moderate', floodRisk: 'Medium',
    waterlog: '5–10 cm', closure: 'No',
    vehicles: ['car','bus'],
    desc: 'Mild waterlogging on 2 stretches — passable for cars.',
    offsets: [[0.003,-0.005],[0.009,0.002],[0.016,0.01],[0.022,0.02]],
  },
  {
    name: 'Route C — Heavy Flooding',
    best: false,
    status: 'flood',
    color: ROUTE_COLORS.flood,
    time: '45 min', dist: '11.2 km',
    traffic: 'Heavy', floodRisk: 'High',
    waterlog: '25+ cm', closure: 'Partial',
    vehicles: [],
    desc: 'Heavy flooding reported — not recommended.',
    offsets: [[-0.004,0.003],[0.002,0.009],[0.01,0.016],[0.022,0.02]],
  },
  {
    name: 'Route D — Emergency Path',
    best: false,
    status: 'emergency',
    color: ROUTE_COLORS.emergency,
    time: '35 min', dist: '10.6 km',
    traffic: 'Clear', floodRisk: 'Low',
    waterlog: 'None', closure: 'No',
    vehicles: ['car','bike','walk'],
    desc: 'Emergency-cleared alternate route — safe for evacuation.',
    offsets: [[-0.007,-0.003],[0.000,0.005],[0.012,0.014],[0.022,0.02]],
  },
];

const STATUS_LABELS = {
  safe:       '<span style="color:#3b82f6">✅ Safe Road</span>',
  mild:       '<span style="color:#eab308">🟡 Mild Waterlogging</span>',
  flood:      '<span style="color:#ef4444">🔴 Heavy Flooding</span>',
  blocked:    '<span style="color:#94a3b8">⛔ Blocked</span>',
  traffic:    '<span style="color:#f97316">🟠 Traffic Congestion</span>',
  emergency:  '<span style="color:#22c55e">🟢 Emergency Safe</span>',
};

function initRouteMap() {
  if (routeMap) return;
  routeMap = L.map('routeMap', { zoomControl: true }).setView([28.6139, 77.2090], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(routeMap);
  window.routeMap = routeMap;
}

async function geocodeCity(name) {
  const r = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(name)}&limit=1&appid=bd5e378503941ddeb2130bba7dc0b700`
  );
  const data = await r.json();
  if (!data || data.length === 0) throw new Error(`Cannot find "${name}"`);
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
}

window.findRoutes = async function() {
  const from = (document.getElementById('routeFrom')?.value || '').trim();
  const to   = (document.getElementById('routeTo')?.value   || '').trim();
  if (!from || !to) { alert('Please enter both source and destination.'); return; }

  initRouteMap();
  clearRoutePolylines();

  let fromCoord, toCoord;
  try {
    [fromCoord, toCoord] = await Promise.all([geocodeCity(from), geocodeCity(to)]);
  } catch(e) {
    alert('Could not find one of the locations. Check spelling and try again.');
    return;
  }

  const fromLL = [fromCoord.lat, fromCoord.lon];
  const toLL   = [toCoord.lat,   toCoord.lon];

  // Fit map
  const bounds = L.latLngBounds([fromLL, toLL]);
  routeMap.fitBounds(bounds, { padding: [60, 60] });

  // Draw markers
  L.marker(fromLL).addTo(routeMap).bindPopup(`🟢 From: ${fromCoord.name}`).openPopup();
  L.marker(toLL  ).addTo(routeMap).bindPopup(`🔴 To: ${toCoord.name}`);

  // Draw simulated routes
  ROUTE_TEMPLATES.forEach((tpl, i) => {
    // Build intermediate points with offsets
    const latlngs = [fromLL];
    tpl.offsets.forEach(([dLat, dLon]) => {
      latlngs.push([
        fromCoord.lat + (toCoord.lat - fromCoord.lat) * ((i + 1) / (ROUTE_TEMPLATES.length + 1)) + dLat * (i * 0.3 + 0.8),
        fromCoord.lon + (toCoord.lon - fromCoord.lon) * ((i + 1) / (ROUTE_TEMPLATES.length + 1)) + dLon * (i * 0.3 + 0.8),
      ]);
    });
    latlngs.push(toLL);

    const poly = L.polyline(latlngs, {
      color:   tpl.color,
      weight:  tpl.best ? 6 : 4,
      opacity: tpl.best ? 1 : 0.75,
      dashArray: tpl.status === 'blocked' ? '8,6' : null,
    }).addTo(routeMap);
    poly.bindTooltip(`<b>${tpl.name}</b><br>${tpl.time} · ${tpl.dist}`, { sticky: true });
    routePolylines.push(poly);
  });

  renderRouteCards(fromCoord.name, toCoord.name);

  // Update info panel
  const info = document.getElementById('routeMapInfo');
  if (info) info.innerHTML = `<strong>📍 ${fromCoord.name}</strong> → <strong>${toCoord.name}</strong> · ${ROUTE_TEMPLATES.length} routes found`;
};

function clearRoutePolylines() {
  routePolylines.forEach(p => p.remove());
  routePolylines = [];
}

function renderRouteCards(fromName, toName) {
  const box = document.getElementById('routeResults');
  if (!box) return;
  box.innerHTML = `<div style="font-size:.75rem;color:#64748b;margin-bottom:6px">📍 ${fromName} → ${toName}</div>`;

  ROUTE_TEMPLATES.forEach(tpl => {
    const vehicleOK = tpl.vehicles.includes(selectedVehicle) || tpl.vehicles.length === 0;
    const dim = !vehicleOK ? 'opacity:.4;pointer-events:none;' : '';
    box.innerHTML += `
      <div class="route-card ${tpl.best ? 'best' : ''}" style="${dim}" onclick="highlightRoute(${ROUTE_TEMPLATES.indexOf(tpl)})">
        <div class="route-header">
          <span class="route-name">${tpl.name}</span>
          ${tpl.best ? '<span class="route-badge-best">✨ Best</span>' : ''}
        </div>
        <div class="route-meta">
          <div class="r-meta">⏱️ <strong>${tpl.time}</strong></div>
          <div class="r-meta">📏 <strong>${tpl.dist}</strong></div>
          <div class="r-meta">🚦 <strong>${tpl.traffic}</strong></div>
          <div class="r-meta">🌊 <strong>${tpl.floodRisk}</strong></div>
          <div class="r-meta">💧 <strong>${tpl.waterlog}</strong></div>
          <div class="r-meta">🚧 <strong>Closure: ${tpl.closure}</strong></div>
        </div>
        <div style="margin-top:6px;font-size:.75rem;color:#94a3b8">${tpl.desc}</div>
        <div style="margin-top:4px;font-size:.75rem">${STATUS_LABELS[tpl.status]}</div>
        <div class="route-status-bar" style="background:${tpl.color}"></div>
      </div>`;
  });
}

window.highlightRoute = function(idx) {
  routePolylines.forEach((p, i) => {
    p.setStyle({ weight: i === idx ? 8 : 3, opacity: i === idx ? 1 : 0.4 });
  });
};

window.selectVehicle = function(el, type) {
  selectedVehicle = type;
  document.querySelectorAll('.vehicle-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
};

window.useGPSRoute = function() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    initRouteMap();
    routeMap.flyTo([latitude, longitude], 13);
    L.marker([latitude, longitude]).addTo(routeMap).bindPopup('📍 Your Location').openPopup();
    const inp = document.getElementById('routeFrom');
    if (inp) inp.value = 'My Location';
  }, () => alert('Location denied.'));
};

// Init map when tab opens (lazy)
window.initRouteMap = initRouteMap;
