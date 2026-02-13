let chatHistory = [
  { role: "user", parts: [{ text: "Hello, who are you?" }] },
  { role: "model", parts: [{ text: "I am Saanvi, your Cyber Safety Assistant." }] }
];


async function sendUserMessage(text) {
    addMessage(text, 'user');
    typingIndicator.classList.add('active');

    try {
        const response = await fetch("/api/chat", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, history: chatHistory })
});

        const data = await response.json();
        
        // Save to history so Saanvi remembers this next time!
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        chatHistory.push({ role: "model", parts: [{ text: data.reply }] });

        typingIndicator.classList.remove('active');
        addMessage(data.reply, 'bot');

    } catch (error) {
        typingIndicator.classList.remove('active');
        addMessage("Connection error. Is the .env.local key correct?", 'bot');
    }
}

// DOM Elements
const chatButton = document.getElementById('chatButton');
const chatWindow = document.getElementById('chatWindow');
const closeWindowBtn = document.getElementById('closeWindowBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const chatBody = document.getElementById('chatBody');
const messagesContainer = document.getElementById('messagesContainer');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const welcomeMessage = document.getElementById('welcomeMessage');
const quickQuestions = document.getElementById('quickQuestions');
const notificationBadge = document.getElementById('notificationBadge');

// State
let messageCount = 0;

// Bot Avatar SVG - Updated Robot Icon
const botAvatarSVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <!-- Antenna -->
    <line x1="50" y1="15" x2="50" y2="30"/>
    <circle cx="50" cy="10" r="5"/>
    <!-- Head -->
    <rect x="25" y="30" width="50" height="40" rx="8"/>
    <!-- Eyes -->
    <circle cx="38" cy="45" r="6"/>
    <circle cx="62" cy="45" r="6"/>
    <!-- Mouth -->
    <rect x="35" y="58" width="30" height="6" rx="2"/>
    <!-- Ears -->
    <rect x="18" y="42" width="7" height="16" rx="2"/>
    <rect x="75" y="42" width="7" height="16" rx="2"/>
    <!-- Neck -->
    <rect x="42" y="70" width="16" height="8"/>
</svg>
`;

// Predefined Responses
const responses = {
    "what is phishing?": "Phishing is a cybercrime where attackers pretend to be trustworthy sources to steal sensitive information like passwords, credit card numbers, or personal data.",
    "is this website safe?": "Check for HTTPS, spelling errors, SSL certificate, professional design, and valid contact info.",
    "how to create strong passwords?": "Use 12+ characters, mix symbols, avoid personal info, use unique passwords and enable 2FA.",
    "cyberbullying": "Do not respond, block the bully, save evidence, report it, and call cyber crime helpline 1930."
};

// Initialize
function init() {
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    chatButton.addEventListener('click', openChat);
    closeWindowBtn.addEventListener('click', closeChat);
    minimizeBtn.addEventListener('click', toggleMinimize);

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.querySelectorAll('.quick-question-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendUserMessage(btn.dataset.question);
        });
    });
}

// Play notification sound
function playNotificationSound() {
    try {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure the beep
        oscillator.frequency.value = 800; // Frequency in Hz (higher = higher pitch)
        oscillator.type = 'sine'; // Smooth sine wave
        
        // Volume envelope (fade in/out for smooth sound)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Fade in
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15); // Fade out
        
        // Play the beep
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15); // Short beep duration
    } catch (error) {
        console.log('Error playing notification sound:', error);
    }
}

// Chat controls
function openChat() {
    chatWindow.classList.add('active');
    chatButton.classList.add('hidden');
    chatInput.focus();
    resetNotificationBadge();
}

function closeChat() {
    chatWindow.classList.remove('active');
    chatButton.classList.remove('hidden');
    chatInput.value = ''; // Clear input
    
    // Clear all messages
    messagesContainer.innerHTML = '';
    
    // Show welcome message and quick questions again
    welcomeMessage.style.display = 'block';
    quickQuestions.style.display = 'flex';
    
    // Reset message count
    messageCount = 0;
}

function toggleMinimize() {
    chatWindow.classList.toggle('minimized');
}

// Messaging
function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        sendUserMessage(message);
        chatInput.value = '';
    }
}

async function sendUserMessage(text) {
    if (messageCount === 0) {
        welcomeMessage.style.display = 'none';
        quickQuestions.style.display = 'none';
    }

    addMessage(text, 'user');
    typingIndicator.classList.add('active');
    scrollToBottom();

    try {
        // This calls the Next.js API route we just checked
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        typingIndicator.classList.remove('active');
        addMessage(data.reply, 'bot'); // 'reply' matches our route.js JSON
        playNotificationSound();

    } catch (error) {
        typingIndicator.classList.remove('active');
        addMessage("Connection error. Please check if the server is running.", 'bot');
    }
}
// Add message with feedback buttons
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    if (sender === 'bot') {
        avatar.innerHTML = botAvatarSVG;

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-actions';

        const likeBtn = document.createElement('button');
        likeBtn.type = 'button'; 
        likeBtn.className = 'feedback-btn';
        likeBtn.innerHTML = '👍';

        const dislikeBtn = document.createElement('button');
        dislikeBtn.type = 'button';  
        dislikeBtn.className = 'feedback-btn dislike';
        dislikeBtn.innerHTML = '👎';

        likeBtn.onclick = () => {
            likeBtn.style.display = 'inline-block';
            dislikeBtn.style.display = 'none';
        };

        dislikeBtn.onclick = () => {
            dislikeBtn.style.display = 'inline-block';
            likeBtn.style.display = 'none';
        };

        feedbackDiv.appendChild(likeBtn);
        feedbackDiv.appendChild(dislikeBtn);

        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);
        contentDiv.appendChild(feedbackDiv);
    } else {
        avatar.textContent = 'U';
        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    messageCount++;
    scrollToBottom();
}

// Bot logic
function getBotResponse(msg) {
    const text = msg.toLowerCase();
    for (let key in responses) {
        if (text.includes(key)) return responses[key];
    }
    if (text.includes('hi') || text.includes('hello')) return "Hello 👋 I'm Saanvi, your Cyber Safety Assistant.";
    if (text.includes('thank')) return "You're welcome! Stay safe online 🛡️";
    return "Ask me about phishing, password safety, cyberbullying, or website security.";
}

// Notifications
function showNotification() {
    notificationBadge.textContent = (parseInt(notificationBadge.textContent) || 0) + 1;
    notificationBadge.style.display = 'flex';
}

function resetNotificationBadge() {
    notificationBadge.textContent = '0';
    notificationBadge.style.display = 'none';
}

// Utils
function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
}

// Init
document.addEventListener('DOMContentLoaded', init);