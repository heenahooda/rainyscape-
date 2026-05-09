/* ═══════════════════════════════════════
   chatbot.js — RainyBot AI
   Context-aware weather & safety chatbot
════════════════════════════════════════ */

const BOT_RESPONSES = {
  en: {
    greet:   ['Hello! I\'m RainyBot 🤖 — your AI weather & safety assistant. Ask me about weather, routes, floods, or safety tips!'],
    weather: [
      'To check weather, type your city name in the Dashboard panel and click "Check Weather" 🌦️',
      'Current weather data is pulled live from OpenWeatherMap. Enter a city to get real-time conditions!',
      'I can help you understand weather conditions! Use the Dashboard tab to search any city.',
    ],
    route: [
      'Go to the 🗺️ Smart Routes tab! Enter your source and destination to see color-coded safe routes.',
      'Our route system shows 4 alternate paths: blue (safe), yellow (waterlogging), red (flooding), and green (emergency).',
      'Always pick the 🟢 blue or green route during heavy rain — avoid red and black routes entirely!',
    ],
    flood: [
      'Check the ⚠️ Disaster Intel tab for live flood heatmaps, community reports, and danger zones!',
      'If you see flooding on your road, use the community report feature to warn others instantly.',
      'Flood risk is color-coded: 🔴 Red = heavy flooding, 🟡 Yellow = waterlogging, 🟢 Green = safe.',
    ],
    sos: [
      'In an emergency, press the 🆘 SOS button on the bottom right — it will share your coordinates!',
      'Call 112 for emergencies in India. The SOS button also alerts emergency services.',
    ],
    safe: [
      '🛡️ Stay inside during thunderstorms. Avoid waterlogged roads and open drains.',
      '🚗 If your car stalls in flood water, exit immediately and move to higher ground.',
      '📱 Keep your phone charged and share live location with family during storms.',
      '🏠 Do not attempt to cross flowing water — even 6 inches can knock you down!',
    ],
    default: [
      'I can help with: weather conditions, safe routes, flood alerts, and safety tips! What would you like to know?',
      'Try asking: "Is it safe to drive?", "How to avoid floods?", or "What is the weather in Delhi?"',
      'Use the navigation tabs above to switch between Dashboard, Smart Routes, and Disaster Intel.',
    ],
  },
  hi: {
    greet:   ['नमस्ते! मैं RainyBot हूँ 🤖 — आपका AI मौसम सहायक। मुझसे मौसम, रास्ते, या सुरक्षा के बारे में पूछें!'],
    default: ['मैं मौसम, बाढ़, और सुरक्षित रास्तों में मदद कर सकता हूँ। Dashboard में शहर का नाम डालें! 🌧️'],
    weather: ['Dashboard में अपना शहर डालें और "Check Weather" क्लिक करें! 🌦️'],
    route:   ['Smart Routes टैब में जाएं — रंगीन रास्ते देखें। नीला = सुरक्षित, लाल = बाढ़!'],
    safe:    ['⚠️ भारी बारिश में घर पर रहें। जलभराव वाली सड़कों से बचें!'],
  },
};

let chatLang = 'en';
let chatHistory = [];
let chatInitialized = false;

function detectIntent(msg) {
  const m = msg.toLowerCase();
  if (m.match(/hello|hi|hey|namaste|hola/))           return 'greet';
  if (m.match(/weather|temp|rain|humid|forecast|sky/)) return 'weather';
  if (m.match(/route|road|drive|way|path|navigate/))   return 'route';
  if (m.match(/flood|water|log|danger|heatmap/))       return 'flood';
  if (m.match(/sos|emergency|help|danger|rescue/))     return 'sos';
  if (m.match(/safe|safety|tip|advice|precaution/))    return 'safe';
  return 'default';
}

function getBotReply(msg) {
  const lang    = chatLang;
  const bank    = BOT_RESPONSES[lang] || BOT_RESPONSES.en;
  const intent  = detectIntent(msg);
  const pool    = bank[intent] || bank.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

function appendMsg(text, role) {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

window.sendChat = function() {
  const inp = document.getElementById('chatInput');
  if (!inp || !inp.value.trim()) return;
  const msg = inp.value.trim();
  inp.value = '';
  appendMsg(msg, 'user');
  chatHistory.push({ role: 'user', text: msg });

  // Typing indicator
  const box = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.id = 'typingIndicator';
  typing.textContent = '🤖 Typing...';
  box?.appendChild(typing);
  box && (box.scrollTop = box.scrollHeight);

  setTimeout(() => {
    const reply = getBotReply(msg);
    typing.remove();
    appendMsg(`🤖 ${reply}`, 'bot');
    chatHistory.push({ role: 'bot', text: reply });
  }, 700 + Math.random() * 400);
};

window.toggleChat = function() {
  const win = document.getElementById('chatWindow');
  if (!win) return;
  win.classList.toggle('hidden');

  // Send greeting on first open
  if (!chatInitialized && !win.classList.contains('hidden')) {
    chatInitialized = true;
    setTimeout(() => {
      const lang = chatLang;
      const bank = BOT_RESPONSES[lang] || BOT_RESPONSES.en;
      appendMsg(`🤖 ${bank.greet[0]}`, 'bot');
    }, 400);
  }
};

// Update chat language when app language changes
window.updateChatLang = function(lang) {
  chatLang = BOT_RESPONSES[lang] ? lang : 'en';
};
