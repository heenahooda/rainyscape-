/* ═══════════════════════════════════════
   particles.js — Background particle engine
   + login rain drops
════════════════════════════════════════ */

// ─── PARTICLE CANVAS (always running) ───
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); particles = []; });

  function mkParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.6 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.05,
      hue:   Math.random() < 0.7 ? 200 : 180,
    };
  }

  for (let i = 0; i < 110; i++) particles.push(mkParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},90%,70%,${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;
    });
    // subtle connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${0.06 * (1 - d/90)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── RAIN CANVAS (weather-triggered) ───
const rainCanvas = document.getElementById('rainCanvas');
const rainCtx    = rainCanvas.getContext('2d');
let rainDrops    = [];
let rainRunning  = false;

function initRainDrops() {
  const W = rainCanvas.width  = window.innerWidth;
  const H = rainCanvas.height = window.innerHeight;
  rainDrops = [];
  for (let i = 0; i < 130; i++) {
    rainDrops.push({
      x: Math.random() * W,
      y: Math.random() * H,
      s: Math.random() * 5 + 4,
      l: Math.random() * 14 + 8,
      a: Math.random() * 0.45 + 0.2,
    });
  }
}

function animateRain() {
  const W = rainCanvas.width;
  const H = rainCanvas.height;
  rainCtx.clearRect(0, 0, W, H);
  rainCtx.lineWidth = 1.5;
  rainDrops.forEach(d => {
    rainCtx.beginPath();
    rainCtx.moveTo(d.x, d.y);
    rainCtx.lineTo(d.x - 1.5, d.y + d.l);
    rainCtx.strokeStyle = `rgba(174,214,241,${d.a})`;
    rainCtx.stroke();
    d.y += d.s;
    if (d.y > H) { d.y = -20; d.x = Math.random() * W; }
  });
  if (rainRunning) requestAnimationFrame(animateRain);
}

window.showRain = function() {
  rainCanvas.style.opacity = '1';
  if (!rainRunning) {
    rainRunning = true;
    initRainDrops();
    animateRain();
  }
};
window.hideRain = function() {
  rainCanvas.style.opacity = '0';
  rainRunning = false;
};

window.addEventListener('resize', () => {
  if (rainRunning) initRainDrops();
});

// ─── LOGIN PAGE RAIN ───
window.spawnLoginRain = function() {
  const layer = document.getElementById('loginRainLayer');
  if (!layer) return;
  layer.innerHTML = '';

  // Rain streaks
  for (let i = 0; i < 65; i++) {
    const el = document.createElement('div');
    el.className = 'l-rain';
    const left   = Math.random() * 100;
    const h      = Math.random() * 70 + 35;
    const dur    = Math.random() * 1.4 + 1.1;
    const delay  = -(Math.random() * 5);
    const alpha  = Math.random() * 0.45 + 0.2;
    el.style.cssText = `left:${left}vw;height:${h}px;opacity:${alpha};` +
                       `animation-duration:${dur}s;animation-delay:${delay}s;`;
    layer.appendChild(el);
  }

  // Floating clouds
  ['☁️','⛅','🌧️','☁️'].forEach((em, i) => {
    const c = document.createElement('div');
    c.className = 'l-cloud';
    c.textContent = em;
    const top  = 3 + i * 11;
    const dur  = 22 + i * 7;
    const del  = -(i * 5);
    c.style.cssText = `top:${top}%;animation-duration:${dur}s;animation-delay:${del}s;`;
    layer.appendChild(c);
  });
};

// Auto-spawn on load
document.addEventListener('DOMContentLoaded', window.spawnLoginRain);
