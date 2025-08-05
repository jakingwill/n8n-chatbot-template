/* -----------------------------------------------------------
   chat-widget.js   (pure JS bundle – no outer <script> tags)
   ----------------------------------------------------------- */

/* 0 .  Load the tiny markdown parser once */
(function loadMarked () {
  if (window.marked) return;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
  s.defer = true;
  document.head.appendChild(s);
})();

/* 1 .  Widget initialiser */
function initN8NChatWidget () {

/* ---------- 1.  STYLES  ---------- */
const styles = `
  /* Root */
  .n8n-chat-widget{
    --chat--color-primary:var(--n8n-chat-primary-color,#854fff);
    --chat--color-secondary:var(--n8n-chat-secondary-color,#6b3fd4);
    --chat--color-background:var(--n8n-chat-background-color,#ffffff);
    --chat--color-font:var(--n8n-chat-font-color,#333333);
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;
  }

  /* Container */
  .n8n-chat-widget .chat-container{
    position:fixed;bottom:20px;right:20px;z-index:1000;
    width:380px;height:600px;display:none;
    background:var(--chat--color-background);border-radius:12px;
    box-shadow:0 8px 32px rgba(0,0,0,.12);
    border:1px solid rgba(0,0,0,.06);
    overflow:hidden;display:flex;flex-direction:column;
  }
  .n8n-chat-widget .chat-container.position-left{right:auto;left:20px}
  .n8n-chat-widget .chat-container.open{display:flex}

  /* Header */
  .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }

        .n8n-chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
        }

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

  /* Welcome */
  .n8n-chat-widget .new-conversation{
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    text-align:center;width:100%;max-width:300px;padding:20px;
  }
  .n8n-chat-widget .new-conversation .welcome-text{
    margin:0 0 24px 0;font-size:24px;line-height:1.3;font-weight:600;color:var(--chat--color-font);
  }
  .n8n-chat-widget .new-conversation .response-text{
    margin:4px 0 0;font-size:14px;line-height:1.4;opacity:.7;
  }
  .n8n-chat-widget .new-chat-btn{
    display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
    padding:16px 24px;font-size:16px;font-weight:500;
    background:linear-gradient(135deg,var(--chat--color-primary)0%,var(--chat--color-secondary)100%);
    color:#fff;border:none;border-radius:8px;cursor:pointer;transition:transform .2s;margin-bottom:12px;
  }
  .n8n-chat-widget .new-chat-btn:hover{transform:scale(1.02)}

  /* Chat interface */
  .n8n-chat-widget .chat-interface{display:none;flex-direction:column;flex:1;min-height:0}
  .n8n-chat-widget .chat-interface.active{display:flex}
  .n8n-chat-widget .chat-messages{flex:1;min-height:0;overflow-y:auto;padding:20px;display:flex;flex-direction:column}

  /* Messages */
  .n8n-chat-widget .chat-message{padding:12px 16px;margin:8px 0;border-radius:12px;max-width:80%;font-size:14px;line-height:1.5;word-wrap:break-word}
  .n8n-chat-widget .chat-message.user{align-self:flex-end;background:linear-gradient(135deg,var(--chat--color-primary)0%,var(--chat--color-secondary)100%);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.1)}
  .n8n-chat-widget .chat-message.bot{align-self:flex-start;background:#fff;border:1px solid rgba(0,0,0,.1);color:#000;box-shadow:0 4px 12px rgba(0,0,0,.05)}
  .n8n-chat-widget .chat-message.loading{opacity:.6;font-style:italic;animation:blink 1.4s infinite}
  @keyframes blink{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}

  /* Input */
  .n8n-chat-widget .chat-input{display:flex;gap:8px;padding:16px;border-top:1px solid rgba(0,0,0,.06)}
  .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }
  .n8n-chat-widget .chat-input button{padding:0 20px;border:none;border-radius:8px;cursor:pointer;font-weight:500;background:linear-gradient(135deg,var(--chat--color-primary)0%,var(--chat--color-secondary)100%);color:#fff;transition:transform .2s}
  .n8n-chat-widget .chat-input button:hover{transform:scale(1.05)}

  /* Toggle */
  .n8n-chat-widget .chat-toggle{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:30px;background:linear-gradient(135deg,var(--chat--color-primary)0%,var(--chat--color-secondary)100%);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);z-index:999;display:flex;align-items:center;justify-content:center;transition:transform .3s}
  .n8n-chat-widget .chat-toggle.position-left{right:auto;left:20px}
  .n8n-chat-widget .chat-toggle:hover{transform:scale(1.05)}

   /* Footer */
  .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }

  /* Wide screens */
  @media (min-width:700px){.n8n-chat-widget .chat-container{max-width:380px}}
`;

/* ---------- 2.  INJECT FONT & STYLES ---------- */
document.head.insertAdjacentHTML(
  'beforeend',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">'
);
const styleTag=document.createElement('style');styleTag.textContent=styles;document.head.appendChild(styleTag);

/* ---------- 3.  CONFIG MERGE ---------- */
const defaults={ webhook:{url:'',route:''}, branding:{logo:'',name:'',welcomeText:'',responseTimeText:'',poweredBy:{text:'Got feedback?',link:'#'}}, metadata:{}, style:{primaryColor:'#854fff',secondaryColor:'#6b3fd4',position:'right',backgroundColor:'#ffffff',fontColor:'#333333'}, behavior:{autoOpen:false}};
const cfg={...defaults,...window.ChatWidgetConfig,
  webhook:{...defaults.webhook ,...(window.ChatWidgetConfig?.webhook ||{})},
  branding:{...defaults.branding,...(window.ChatWidgetConfig?.branding||{})},
  metadata:{...defaults.metadata,...(window.ChatWidgetConfig?.metadata||{})},
  style:{...defaults.style ,...(window.ChatWidgetConfig?.style   ||{})},
  behavior:{...defaults.behavior ,...(window.ChatWidgetConfig?.behavior||{})}
};
if(!cfg.webhook.url){console.error('Chat widget: webhook.url missing');return;}
if(window.N8NChatWidgetInitialized)return;window.N8NChatWidgetInitialized=true;

/* ---------- 4.  BUILD DOM ---------- */
const root=document.createElement('div');root.className='n8n-chat-widget';
root.style.setProperty('--n8n-chat-primary-color',cfg.style.primaryColor);
root.style.setProperty('--n8n-chat-secondary-color',cfg.style.secondaryColor);
root.style.setProperty('--n8n-chat-background-color',cfg.style.backgroundColor);
root.style.setProperty('--n8n-chat-font-color',cfg.style.fontColor);

root.innerHTML=`
  <div class="chat-container${cfg.style.position==='left'?' position-left':''}">
    <div class="brand-header">
      <div class="brand-title">
        <img src="${cfg.branding.logo}" alt="">
        <span>${cfg.branding.name}</span>
      </div>
      <button class="close-button" aria-label="Close chat">×</button>
    </div>
    <div class="new-conversation">
      <h2 class="welcome-text">${cfg.branding.welcomeText}</h2>
      <button class="new-chat-btn">Send us a message</button>
      <p class="response-text">${cfg.branding.responseTimeText}</p>
    </div>
    <div class="chat-interface">
      <div class="chat-messages"></div>
      <div class="chat-input">
        <textarea placeholder="Type your message here..." rows="2"></textarea>
        <button type="submit">Send</button>
      </div>
      <div class="chat-footer">
        <a href="${cfg.branding.poweredBy.link}" target="_blank">${cfg.branding.poweredBy.text}</a>
      </div>
    </div>
  </div>
  <button class="chat-toggle${cfg.style.position==='left'?' position-left':''}">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 00-9.949 9.06A10 10 0 002 12c0 5.523 4.477 10 10 10a9.96 9.96 0 005.002-1.312L22 22l-1.312-4.998A9.96 9.96 0 0022 12c0-5.523-4.477-10-10-10Z"/></svg>
  </button>`;
document.body.appendChild(root);

/* ---------- 5.  DOM refs ---------- */
const chatContainer=root.querySelector('.chat-container');
const newConv=root.querySelector('.new-conversation');
const chatUI=root.querySelector('.chat-interface');
const messagesDiv=root.querySelector('.chat-messages');
const textarea=root.querySelector('textarea');
const sendBtn=root.querySelector('.chat-input button');
const newChatBtn=root.querySelector('.new-chat-btn');
const closeBtn=root.querySelector('.close-button');
const toggle=root.querySelector('.chat-toggle');
let sessionId='';

/* ---------- 6.  HELPERS ---------- */
const uuid=()=>crypto.randomUUID();
const scrollToBottom=()=>{messagesDiv.scrollTop=messagesDiv.scrollHeight;};
const renderMarkdown=txt=>window.marked?marked.parse(txt):txt.replace(/\n/g,'<br>');

/* ---------- 7.  API ---------- */
async function post(body){
  return fetch(cfg.webhook.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
}

/* ---------- 8.  CHAT FLOW ---------- */
async function startConversation(){
  sessionId=uuid();
  newConv.style.display='none';
  chatUI.classList.add('active');

  const thinking=document.createElement('div');
  thinking.className='chat-message bot loading';thinking.textContent='Thinking…';
  messagesDiv.appendChild(thinking);scrollToBottom();

  try{
    const res=await post([{action:'loadPreviousSession',sessionId,route:cfg.webhook.route,metadata:cfg.metadata}]);
    thinking.remove();
    const bot=document.createElement('div');bot.className='chat-message bot';
    bot.innerHTML=renderMarkdown(Array.isArray(res)?res[0].output:res.output);
    messagesDiv.appendChild(bot);scrollToBottom();
  }catch(e){console.error(e);thinking.textContent='Error loading.';}
}

async function sendMsg(){
  const text=textarea.value.trim();if(!text)return;textarea.value='';
  const user=document.createElement('div');user.className='chat-message user';user.textContent=text;
  messagesDiv.appendChild(user);scrollToBottom();

  const thinking=document.createElement('div');thinking.className='chat-message bot loading';thinking.textContent='Thinking…';
  messagesDiv.appendChild(thinking);scrollToBottom();

  try{
    const res=await post({action:'sendMessage',sessionId,route:cfg.webhook.route,chatInput:text,metadata:cfg.metadata});
    thinking.remove();
    const bot=document.createElement('div');bot.className='chat-message bot';
    bot.innerHTML=renderMarkdown(Array.isArray(res)?res[0].output:res.output);
    messagesDiv.appendChild(bot);scrollToBottom();
  }catch(e){console.error(e);thinking.textContent='Error :('; }
}

/* ---------- 9.  EVENTS ---------- */
newChatBtn.onclick = startConversation;
sendBtn.onclick    = sendMsg;

textarea.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
});

/* launcher */
toggleButton.addEventListener('click', () => {
  chatContainer.classList.toggle('open');
});

/* close buttons */
chatContainer.querySelectorAll('.close-button').forEach(btn => {
  btn.addEventListener('click', () => {
    chatContainer.classList.remove('open');
  });
});

/* ---------- 10.  AUTO OPEN? ---------- */
if (cfg.behavior.autoOpen) {
  chatContainer.classList.add('open');
}

/* ---------- END OF initN8NChatWidget ---------- */
}   // ← this closes the function!
/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

/* Auto-init after DOM ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initN8NChatWidget);
} else {
  initN8NChatWidget();
}

/* Expose global */
if (typeof window !== 'undefined') {
  window.initN8NChatWidget = initN8NChatWidget;
