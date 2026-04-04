(function() {
  var script = document.currentScript;
  var businessId = script && script.getAttribute('data-business-id');
  var apiBase = (script && script.src) ? script.src.replace('/widget.js', '') : 'https://botpress-ai.vercel.app';
  var primaryColor = (script && script.getAttribute('data-color')) || '#2563eb';

  if (!businessId) { console.error('BotPress AI Widget: missing data-business-id'); return; }

  var isOpen = false;
  var messages = [];
  var isTyping = false;
  var visitorId = 'visitor-' + Math.random().toString(36).substr(2, 9);

  // Styles
  var style = document.createElement('style');
  style.textContent = '\
    #bp-bubble{position:fixed;bottom:24px;right:24px;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,' + primaryColor + ',#7c3aed);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(37,99,235,0.3),0 0 0 0 rgba(37,99,235,0.4);display:flex;align-items:center;justify-content:center;z-index:99999;transition:all .3s ease;animation:bp-pulse 3s infinite}\
    #bp-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(37,99,235,0.4)}\
    #bp-bubble svg{width:28px;height:28px;fill:white}\
    @keyframes bp-pulse{0%,100%{box-shadow:0 4px 20px rgba(37,99,235,0.3),0 0 0 0 rgba(37,99,235,0.3)}50%{box-shadow:0 4px 20px rgba(37,99,235,0.3),0 0 0 8px rgba(37,99,235,0)}}\
    #bp-win{position:fixed;bottom:100px;right:24px;width:380px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 130px);border-radius:20px;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.04);display:none;flex-direction:column;overflow:hidden;z-index:99998;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;direction:rtl}\
    #bp-win.open{display:flex;animation:bp-up .3s ease}\
    @keyframes bp-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}\
    .bp-hdr{background:linear-gradient(135deg,' + primaryColor + ',#7c3aed);padding:20px;display:flex;align-items:center;justify-content:space-between}\
    .bp-hdr-info{display:flex;align-items:center;gap:12px}\
    .bp-hdr-av{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center}\
    .bp-hdr-av svg{width:22px;height:22px;fill:white}\
    .bp-hdr-nm{color:white;font-size:15px;font-weight:600}\
    .bp-hdr-st{color:rgba(255,255,255,0.7);font-size:11px;display:flex;align-items:center;gap:5px}\
    .bp-hdr-st::before{content:"";width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block}\
    .bp-close{background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;padding:6px;font-size:22px;line-height:1;border-radius:8px;transition:all .2s}\
    .bp-close:hover{color:white;background:rgba(255,255,255,0.1)}\
    .bp-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc}\
    .bp-msg{max-width:82%;padding:12px 16px;font-size:14px;line-height:1.6;word-break:break-word;animation:bp-up .2s ease}\
    .bp-msg-u{align-self:flex-start;background:linear-gradient(135deg,' + primaryColor + ',#4f46e5);color:white;border-radius:18px 18px 6px 18px}\
    .bp-msg-b{align-self:flex-end;background:white;color:#1e293b;border:1px solid #e8ecf1;border-radius:18px 18px 18px 6px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}\
    .bp-typing{align-self:flex-end;display:flex;gap:5px;padding:14px 18px;background:white;border:1px solid #e8ecf1;border-radius:18px 18px 18px 6px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}\
    .bp-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:bp-bounce 1.2s infinite}\
    .bp-dot:nth-child(2){animation-delay:.15s}\
    .bp-dot:nth-child(3){animation-delay:.3s}\
    @keyframes bp-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}\
    .bp-input{padding:14px 16px;border-top:1px solid #e8ecf1;display:flex;gap:10px;background:white}\
    .bp-input input{flex:1;border:1px solid #e2e8f0;border-radius:24px;padding:10px 18px;font-size:14px;outline:none;direction:rtl;font-family:inherit;transition:border .2s}\
    .bp-input input:focus{border-color:' + primaryColor + ';box-shadow:0 0 0 3px rgba(37,99,235,0.08)}\
    .bp-send{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,' + primaryColor + ',#7c3aed);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}\
    .bp-send:hover{transform:scale(1.06)}\
    .bp-send:disabled{opacity:0.4;cursor:not-allowed;transform:none}\
    .bp-send svg{width:18px;height:18px;fill:white}\
    .bp-pw{text-align:center;padding:8px;font-size:10px;color:#94a3b8;background:white;letter-spacing:0.3px}\
    .bp-pw a{color:#94a3b8;text-decoration:none}\
    .bp-pw a:hover{color:#64748b}\
  ';
  document.head.appendChild(style);

  var chatSvg = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>';
  var botSvg = '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.27A7 7 0 0112 22a7 7 0 01-7.73-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2zm-2 13a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/></svg>';
  var sendSvg = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // Bubble
  var bubble = document.createElement('button');
  bubble.id = 'bp-bubble';
  bubble.innerHTML = chatSvg;
  bubble.setAttribute('aria-label', 'פתח צ׳אט');
  document.body.appendChild(bubble);

  // Window
  var win = document.createElement('div');
  win.id = 'bp-win';
  win.innerHTML = '\
    <div class="bp-hdr">\
      <div class="bp-hdr-info">\
        <div class="bp-hdr-av">' + botSvg + '</div>\
        <div><div class="bp-hdr-nm">שירות לקוחות</div><div class="bp-hdr-st">מקוון</div></div>\
      </div>\
      <button class="bp-close" aria-label="סגור">&times;</button>\
    </div>\
    <div class="bp-msgs" id="bp-msgs"></div>\
    <div class="bp-input">\
      <button class="bp-send" id="bp-send" disabled>' + sendSvg + '</button>\
      <input id="bp-inp" placeholder="כתוב הודעה..." autocomplete="off">\
    </div>\
    <div class="bp-pw"><a href="https://botpress-ai.vercel.app" target="_blank">Powered by BotPress AI</a></div>\
  ';
  document.body.appendChild(win);

  var msgBox = document.getElementById('bp-msgs');
  var inp = document.getElementById('bp-inp');
  var sendBtn = document.getElementById('bp-send');
  var closeBtn = win.querySelector('.bp-close');
  var history = [];

  bubble.onclick = function() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) addMsg('bot', 'שלום! איך אפשר לעזור?');
    if (isOpen) inp.focus();
  };
  closeBtn.onclick = function() { isOpen = false; win.classList.remove('open'); };
  inp.oninput = function() { sendBtn.disabled = !inp.value.trim(); };
  inp.onkeydown = function(e) { if (e.key === 'Enter' && !sendBtn.disabled) send(); };
  sendBtn.onclick = send;

  function addMsg(role, text) {
    messages.push({ role: role, text: text });
    var d = document.createElement('div');
    d.className = 'bp-msg bp-msg-' + (role === 'user' ? 'u' : 'b');
    d.textContent = text;
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    var d = document.createElement('div');
    d.className = 'bp-typing'; d.id = 'bp-typ';
    d.innerHTML = '<div class="bp-dot"></div><div class="bp-dot"></div><div class="bp-dot"></div>';
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function hideTyping() { isTyping = false; var e = document.getElementById('bp-typ'); if (e) e.remove(); }

  function send() {
    var text = inp.value.trim();
    if (!text) return;
    inp.value = ''; sendBtn.disabled = true;
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    showTyping();

    fetch(apiBase + '/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, businessId: businessId, conversationHistory: history.slice(-10) })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      hideTyping();
      var reply = data.content || 'מצטער, אירעה שגיאה.';
      addMsg('bot', reply);
      history.push({ role: 'assistant', content: reply });
    })
    .catch(function() {
      hideTyping();
      addMsg('bot', 'מצטער, לא הצלחתי להתחבר. נסה שוב.');
    });
  }
})();
