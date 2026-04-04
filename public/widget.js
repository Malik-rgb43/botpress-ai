(function() {
  // Get business ID from script tag
  const script = document.currentScript;
  const businessId = script?.getAttribute('data-business-id');
  const apiBase = script?.src?.replace('/widget.js', '') || 'https://botpress-ai.vercel.app';

  if (!businessId) {
    console.error('BotPress AI Widget: missing data-business-id');
    return;
  }

  // State
  let isOpen = false;
  let messages = [];
  let isTyping = false;

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    #bp-widget-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(37, 99, 235, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: all 0.3s ease;
    }
    #bp-widget-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(37, 99, 235, 0.45);
    }
    #bp-widget-bubble svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #bp-widget-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 120px);
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 8px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 99998;
      animation: bp-slide-up 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      direction: rtl;
    }
    #bp-widget-window.bp-open { display: flex; }
    @keyframes bp-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .bp-header {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .bp-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .bp-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bp-header-avatar svg { width: 20px; height: 20px; fill: white; }
    .bp-header-name {
      color: white;
      font-size: 15px;
      font-weight: 600;
    }
    .bp-header-status {
      color: rgba(255,255,255,0.7);
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .bp-header-status::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
    }
    .bp-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      padding: 4px;
      font-size: 20px;
      line-height: 1;
    }
    .bp-close:hover { color: white; }
    .bp-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }
    .bp-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
    }
    .bp-msg-user {
      align-self: flex-start;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: white;
      border-bottom-right-radius: 6px;
    }
    .bp-msg-bot {
      align-self: flex-end;
      background: white;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 6px;
    }
    .bp-typing {
      align-self: flex-end;
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      border-bottom-left-radius: 6px;
    }
    .bp-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
      animation: bp-bounce 1.2s infinite;
    }
    .bp-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .bp-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes bp-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    .bp-input-area {
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      background: white;
    }
    .bp-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      direction: rtl;
      font-family: inherit;
    }
    .bp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .bp-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .bp-send:hover { transform: scale(1.05); }
    .bp-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .bp-send svg { width: 18px; height: 18px; fill: white; }
    .bp-powered {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #94a3b8;
      background: white;
    }
  `;
  document.head.appendChild(style);

  // Chat icon SVG
  const chatIcon = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>';
  const botIcon = '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.27A7 7 0 0112 22a7 7 0 01-7.73-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2zm-2 13a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/></svg>';
  const sendIcon = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // Create bubble
  const bubble = document.createElement('button');
  bubble.id = 'bp-widget-bubble';
  bubble.innerHTML = chatIcon;
  bubble.setAttribute('aria-label', '\u05E4\u05EA\u05D7 \u05E6\u05F3\u05D0\u05D8');
  document.body.appendChild(bubble);

  // Create window
  const win = document.createElement('div');
  win.id = 'bp-widget-window';
  win.innerHTML = `
    <div class="bp-header">
      <div class="bp-header-info">
        <div class="bp-header-avatar">${botIcon}</div>
        <div>
          <div class="bp-header-name">\u05D1\u05D5\u05D8 \u05E9\u05D9\u05E8\u05D5\u05EA</div>
          <div class="bp-header-status">\u05DE\u05E7\u05D5\u05D5\u05DF</div>
        </div>
      </div>
      <button class="bp-close" aria-label="\u05E1\u05D2\u05D5\u05E8 \u05E6\u05F3\u05D0\u05D8">&times;</button>
    </div>
    <div class="bp-messages" id="bp-messages"></div>
    <div class="bp-input-area">
      <button class="bp-send" id="bp-send" disabled>${sendIcon}</button>
      <input class="bp-input" id="bp-input" placeholder="\u05DB\u05EA\u05D5\u05D1 \u05D4\u05D5\u05D3\u05E2\u05D4..." autocomplete="off">
    </div>
    <div class="bp-powered">Powered by BotPress AI</div>
  `;
  document.body.appendChild(win);

  // Elements
  const msgContainer = document.getElementById('bp-messages');
  const input = document.getElementById('bp-input');
  const sendBtn = document.getElementById('bp-send');
  const closeBtn = win.querySelector('.bp-close');
  const history = [];

  // Toggle
  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    win.classList.toggle('bp-open', isOpen);
    if (isOpen && messages.length === 0) {
      addMessage('bot', '\u05E9\u05DC\u05D5\u05DD! \u05D0\u05D9\u05DA \u05D0\u05E4\u05E9\u05E8 \u05DC\u05E2\u05D6\u05D5\u05E8?');
    }
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    win.classList.remove('bp-open');
  });

  // Input
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) send();
  });

  sendBtn.addEventListener('click', send);

  function addMessage(role, text) {
    messages.push({ role, text });
    const div = document.createElement('div');
    div.className = 'bp-msg bp-msg-' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    const div = document.createElement('div');
    div.className = 'bp-typing';
    div.id = 'bp-typing';
    div.innerHTML = '<div class="bp-typing-dot"></div><div class="bp-typing-dot"></div><div class="bp-typing-dot"></div>';
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    const el = document.getElementById('bp-typing');
    if (el) el.remove();
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    showTyping();

    try {
      const res = await fetch(apiBase + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          businessId: businessId,
          conversationHistory: history.slice(-10),
        }),
      });
      const data = await res.json();
      hideTyping();
      const reply = data.content || '\u05DE\u05E6\u05D8\u05E2\u05E8, \u05D0\u05D9\u05E8\u05E2\u05D4 \u05E9\u05D2\u05D9\u05D0\u05D4.';
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (e) {
      hideTyping();
      addMessage('bot', '\u05DE\u05E6\u05D8\u05E2\u05E8, \u05DC\u05D0 \u05D4\u05E6\u05DC\u05D7\u05EA\u05D9 \u05DC\u05D4\u05EA\u05D7\u05D1\u05E8. \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1.');
    }
  }
})();
