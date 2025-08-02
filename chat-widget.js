(function () {
  // Load font
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
  document.head.appendChild(fontLink);

  // Default configuration
  const defaultConfig = {
    webhook: {
      url: '',
      route: ''
    },
    branding: {
      logo: '',
      name: '',
      welcomeText: '',
      responseTimeText: '',
      poweredBy: {
        text: 'Powered by Mad',
        link: 'https://n8n.partnerlinks.io/m8a94i19zhqq?utm_source=nocodecreative.io'
      }
    },
    metadata: {},
    style: {
      primaryColor: '#854fff',
      secondaryColor: '#6b3fd4',
      position: 'right',
      backgroundColor: '#ffffff',
      fontColor: '#333333'
    }
  };

  // Merge user config
  const userConfig = window.ChatWidgetConfig || {};
  const config = {
    webhook: { ...defaultConfig.webhook, ...userConfig.webhook },
    branding: { ...defaultConfig.branding, ...userConfig.branding },
    metadata: { ...defaultConfig.metadata, ...userConfig.metadata },
    style: { ...defaultConfig.style, ...userConfig.style }
  };

  if (!config.webhook.url) {
    console.error("Chat widget misconfigured: missing 'webhook.url'");
    return;
  }

  // Prevent multiple instances
  if (window.N8NChatWidgetInitialized) return;
  window.N8NChatWidgetInitialized = true;

  let currentSessionId = '';

  // ---- DOM Setup (simplified) ---- //
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'n8n-chat-widget';
  widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
  widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
  widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
  widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

  // Chat container
  const chatContainer = document.createElement('div');
  chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

  // New Conversation UI
  const newConversationHTML = `
    <div class="brand-header">
      <img src="${config.branding.logo}" alt="${config.branding.name}">
      <span>${config.branding.name}</span>
      <button class="close-button">×</button>
    </div>
    <div class="new-conversation">
      <h2 class="welcome-text">${config.branding.welcomeText}</h2>
      <button class="new-chat-btn">Send us a message</button>
      <p class="response-text">${config.branding.responseTimeText}</p>
    </div>
  `;

  // Chat Interface UI
  const chatInterfaceHTML = `
    <div class="chat-interface">
      <div class="brand-header">
        <img src="${config.branding.logo}" alt="${config.branding.name}">
        <span>${config.branding.name}</span>
        <button class="close-button">×</button>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input">
        <textarea placeholder="Type your message here..." rows="1"></textarea>
        <button type="submit">Send</button>
      </div>
      <div class="chat-footer">
        <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
      </div>
    </div>
  `;

  chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

  const toggleButton = document.createElement('button');
  toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
  toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="..."/></svg>`;

  widgetContainer.appendChild(chatContainer);
  widgetContainer.appendChild(toggleButton);
  document.body.appendChild(widgetContainer);

  const newChatBtn = chatContainer.querySelector('.new-chat-btn');
  const chatInterface = chatContainer.querySelector('.chat-interface');
  const messagesContainer = chatContainer.querySelector('.chat-messages');
  const textarea = chatContainer.querySelector('textarea');
  const sendButton = chatContainer.querySelector('button[type="submit"]');

  function generateUUID() {
    return crypto.randomUUID();
  }

  async function startNewConversation() {
    currentSessionId = generateUUID();

    const data = [{
      action: "loadPreviousSession",
      sessionId: currentSessionId,
      route: config.webhook.route,
      metadata: config.metadata
    }];

    try {
      const response = await fetch(config.webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      chatContainer.querySelector('.brand-header').style.display = 'none';
      chatContainer.querySelector('.new-conversation').style.display = 'none';
      chatInterface.classList.add('active');

      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'chat-message bot';
      botMessageDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
      messagesContainer.appendChild(botMessageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
      console.error('Chat load error:', error);
    }
  }

  async function sendMessage(message) {
    const payload = {
      action: "sendMessage",
      sessionId: currentSessionId,
      route: config.webhook.route,
      chatInput: message,
      metadata: config.metadata
    };

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.textContent = message;
    messagesContainer.appendChild(userMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(config.webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'chat-message bot';
      botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
      messagesContainer.appendChild(botMessageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Chat send error:', error);
    }
  }

  // Event Listeners
  newChatBtn.addEventListener('click', startNewConversation);

  sendButton.addEventListener('click', () => {
    const message = textarea.value.trim();
    if (message) {
      sendMessage(message);
      textarea.value = '';
    }
  });

  textarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = textarea.value.trim();
      if (message) {
        sendMessage(message);
        textarea.value = '';
      }
    }
  });

  toggleButton.addEventListener('click', () => {
    chatContainer.classList.toggle('open');
  });

  chatContainer.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', () => {
      chatContainer.classList.remove('open');
    });
  });
})();
