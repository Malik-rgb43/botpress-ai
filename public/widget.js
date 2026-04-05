(function() {
  var script = document.currentScript;
  var businessId = script && script.getAttribute('data-business-id');
  var apiBase = (script && script.src) ? script.src.replace('/widget.js', '') : 'https://botpress-ai.vercel.app';
  var color = (script && script.getAttribute('data-color')) || '#2e90fa';
  var position = (script && script.getAttribute('data-position')) || 'right';

  if (!businessId) { console.error('BotPress AI Widget: data-business-id missing'); return; }

  var isOpen = false, messages = [], isTyping = false;
  var history = [];

  // Inject styles
  var s = document.createElement('style');
  s.textContent = '\
    @keyframes bp-pop{from{opacity:0;transform:scale(0.8) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}\
    @keyframes bp-pulse{0%,100%{box-shadow:0 4px 20px rgba(46,144,250,0.25),0 0 0 0 rgba(46,144,250,0.25)}50%{box-shadow:0 4px 20px rgba(46,144,250,0.25),0 0 0 10px rgba(46,144,250,0)}}\
    @keyframes bp-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}\
    @keyframes bp-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
    \
    #bp-fab{position:fixed;bottom:24px;' + position + ':24px;z-index:99999;width:60px;height:60px;border-radius:50%;background:' + color + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(46,144,250,0.25);animation:bp-pulse 3s infinite;transition:all .25s ease}\
    #bp-fab:hover{transform:scale(1.06);box-shadow:0 6px 28px rgba(46,144,250,0.35)}\
    #bp-fab.open{border-radius:16px;width:52px;height:52px;animation:none}\
    #bp-fab svg{width:26px;height:26px;fill:#fff;transition:transform .3s ease}\
    #bp-fab.open svg{transform:rotate(45deg)}\
    \
    #bp-chat{position:fixed;bottom:96px;' + position + ':24px;width:400px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 130px);border-radius:20px;background:#fff;box-shadow:0 16px 64px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.03);display:none;flex-direction:column;overflow:hidden;z-index:99998;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;direction:rtl}\
    #bp-chat.open{display:flex;animation:bp-pop .25s ease}\
    \
    .bp-h{background:linear-gradient(135deg,' + color + ',#7c3aed);padding:20px 20px 16px;position:relative;overflow:hidden}\
    .bp-h::before{content:"";position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.07)}\
    .bp-h::after{content:"";position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.05)}\
    .bp-h-top{display:flex;align-items:center;gap:12px;position:relative;z-index:1}\
    .bp-h-av{width:42px;height:42px;border-radius:14px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}\
    .bp-h-av svg{width:22px;height:22px;fill:#fff}\
    .bp-h-nm{color:#fff;font-size:16px;font-weight:700;letter-spacing:-0.3px}\
    .bp-h-st{color:rgba(255,255,255,0.65);font-size:12px;display:flex;align-items:center;gap:5px;margin-top:2px}\
    .bp-h-st i{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block}\
    .bp-h-x{position:absolute;top:16px;left:16px;background:rgba(255,255,255,0.1);border:none;color:rgba(255,255,255,0.7);width:32px;height:32px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .2s;z-index:2;backdrop-filter:blur(4px)}\
    .bp-h-x:hover{background:rgba(255,255,255,0.2);color:#fff}\
    \
    .bp-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#fafbfe}\
    .bp-body::-webkit-scrollbar{width:4px}\
    .bp-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:10px}\
    \
    .bp-m{max-width:82%;padding:12px 16px;font-size:14px;line-height:1.6;word-break:break-word;animation:bp-fadein .2s ease}\
    .bp-mu{align-self:flex-start;background:' + color + ';color:#fff;border-radius:20px 20px 8px 20px}\
    .bp-mb{align-self:flex-end;background:#fff;color:#1e293b;border:1px solid rgba(0,0,0,0.06);border-radius:20px 20px 20px 8px;box-shadow:0 1px 4px rgba(0,0,0,0.04)}\
    \
    .bp-typ{align-self:flex-end;display:flex;gap:5px;padding:14px 18px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);animation:bp-fadein .2s ease}\
    .bp-dot{width:7px;height:7px;border-radius:50%;background:#cbd5e1;animation:bp-bounce 1.2s infinite}\
    .bp-dot:nth-child(2){animation-delay:.15s}\
    .bp-dot:nth-child(3){animation-delay:.3s}\
    \
    .bp-bar{padding:14px 16px;border-top:1px solid rgba(0,0,0,0.04);display:flex;gap:10px;background:#fff}\
    .bp-bar input{flex:1;border:1.5px solid rgba(0,0,0,0.06);border-radius:14px;padding:11px 16px;font-size:14px;outline:none;direction:rtl;font-family:inherit;background:#fafbfe;transition:all .2s}\
    .bp-bar input:focus{border-color:' + color + ';background:#fff;box-shadow:0 0 0 3px ' + color + '14}\
    .bp-bar input::placeholder{color:#a0aec0}\
    .bp-snd{width:44px;height:44px;border-radius:14px;background:' + color + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 2px 8px ' + color + '40}\
    .bp-snd:hover{transform:translateY(-1px);box-shadow:0 4px 12px ' + color + '50}\
    .bp-snd:disabled{opacity:0.35;cursor:not-allowed;transform:none;box-shadow:none}\
    .bp-snd svg{width:18px;height:18px;fill:#fff}\
    \
    .bp-ft{text-align:center;padding:8px;font-size:10px;background:#fff;border-top:1px solid rgba(0,0,0,0.03)}\
    .bp-ft a{color:#c0c8d4;text-decoration:none;letter-spacing:0.3px}\
    .bp-ft a:hover{color:#94a3b8}\
  ';
  document.head.appendChild(s);

  var botSvg = '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.27A7 7 0 0112 22a7 7 0 01-7.73-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2zm-2 13a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/></svg>';
  var sendSvg = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var chatSvg = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>';
  var plusSvg = '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';

  // FAB button
  var fab = document.createElement('button');
  fab.id = 'bp-fab';
  fab.innerHTML = chatSvg;
  fab.setAttribute('aria-label', 'פתח צ׳אט');
  document.body.appendChild(fab);

  // Chat window
  var chat = document.createElement('div');
  chat.id = 'bp-chat';
  chat.innerHTML = '\
    <div class="bp-h">\
      <button class="bp-h-x" aria-label="סגור">&times;</button>\
      <div class="bp-h-top">\
        <div class="bp-h-av">' + botSvg + '</div>\
        <div>\
          <div class="bp-h-nm">שירות לקוחות</div>\
          <div class="bp-h-st"><i></i> מקוון — תגובה מיידית</div>\
        </div>\
      </div>\
    </div>\
    <div class="bp-body" id="bp-body"></div>\
    <div class="bp-bar">\
      <button class="bp-snd" id="bp-snd" disabled>' + sendSvg + '</button>\
      <input id="bp-inp" placeholder="שאל אותי משהו..." autocomplete="off">\
    </div>\
    <div class="bp-ft"><a href="https://botpress-ai.vercel.app" target="_blank">Powered by BotPress AI</a></div>\
  ';
  document.body.appendChild(chat);

  var body = document.getElementById('bp-body');
  var inp = document.getElementById('bp-inp');
  var snd = document.getElementById('bp-snd');
  var cls = chat.querySelector('.bp-h-x');

  fab.onclick = function() {
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    fab.classList.toggle('open', isOpen);
    fab.innerHTML = isOpen ? plusSvg : chatSvg;
    if (isOpen && !messages.length) addMsg('b', 'שלום! איך אפשר לעזור? 👋');
    if (isOpen) setTimeout(function() { inp.focus(); }, 100);
  };
  cls.onclick = function() {
    isOpen = false;
    chat.classList.remove('open');
    fab.classList.remove('open');
    fab.innerHTML = chatSvg;
  };
  inp.oninput = function() { snd.disabled = !inp.value.trim(); };
  inp.onkeydown = function(e) { if (e.key === 'Enter' && !snd.disabled) send(); };
  snd.onclick = send;

  function addMsg(r, t) {
    messages.push({r:r,t:t});
    var d = document.createElement('div');
    d.className = 'bp-m bp-m' + r;
    d.textContent = t;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function showTyp() {
    isTyping = true;
    var d = document.createElement('div');
    d.className = 'bp-typ'; d.id = 'bp-typ';
    d.innerHTML = '<div class="bp-dot"></div><div class="bp-dot"></div><div class="bp-dot"></div>';
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyp() { isTyping = false; var e = document.getElementById('bp-typ'); if (e) e.remove(); }

  function send() {
    var t = inp.value.trim();
    if (!t) return;
    inp.value = ''; snd.disabled = true;
    addMsg('u', t);
    history.push({role:'user',content:t});
    showTyp();
    fetch(apiBase + '/api/ai/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message:t, businessId:businessId, conversationHistory:history.slice(-10)})
    })
    .then(function(r){return r.json()})
    .then(function(d){
      hideTyp();
      var reply = d.content || 'מצטער, אירעה שגיאה.';
      addMsg('b', reply);
      history.push({role:'assistant',content:reply});
    })
    .catch(function(){
      hideTyp();
      addMsg('b', 'מצטער, לא הצלחתי להתחבר. נסה שוב.');
    });
  }
})();
