/* ==========================================
   State & Constants
   ========================================== */
let breathingInterval = null;
let breathingCycleTimeout = null;
let isBreathingRunning = false;

// Wellness Tips Database based on Moods
const moodTips = {
    calm: [
        "Quiet moments are opportunities to connect with yourself. Enjoy this peace.",
        "Take a slow walk, notice the sounds around you, and appreciate the present moment.",
        "Write down three things you are grateful for today, no matter how small they seem.",
        "Continue maintaining this peaceful state by reading a book or listening to soft music."
    ],
    stressed: [
        "In moments of high stress, focus on what you can control. Let go of the rest.",
        "Try the 4-7-8 breathing exercise on the left sidebar to lower your heart rate.",
        "Unclench your jaw, roll your shoulders back, and take a deep, slow breath.",
        "Step away from screens for 5 minutes and drink a glass of cool water."
    ],
    sad: [
        "It's completely okay to not be okay. Allow yourself to feel without judgment.",
        "Wrap yourself in a warm blanket and listen to a comforting, familiar song.",
        "You don't have to solve everything today. Focus on just getting through the next hour.",
        "Is there a trusted friend or family member you could send a quick message to?"
    ],
    tired: [
        "Rest is not laziness; it is a necessity. Give yourself permission to recharge.",
        "A 15-minute power nap or just closing your eyes can do wonders for your energy.",
        "Stretch your arms overhead, elongate your spine, and take a deep breath.",
        "Have a light snack or a warm cup of herbal tea to gently wake up your senses."
    ],
    happy: [
        "Bottle up this feeling! Write down what made you happy today so you can read it later.",
        "Share your positive energy with someone else—send a kind text to a friend.",
        "Celebrate your wins, big or small. You've earned this joyful moment!",
        "Take a moment to dance to your favorite song and soak in the good vibes."
    ]
};

// Local chatbot responses mapping
const localResponses = {
    greetings: [
        "Hello! I am your wellness companion. I'm here to listen, support, and help you find calm. How has your day been so far?",
        "Hi there! Thank you for checking in. How are you feeling right now? I'm here to support you in any way I can.",
        "Hey! Welcome to your wellness space. Take a deep breath and tell me what's on your mind today."
    ],
    anxious: [
        "It sounds like you're carrying a lot of anxiety right now. Let's take a pause together. Have you tried our **Guided Breathing** session in the left panel? Just 2 minutes of it can help ground your body. What's currently occupying your thoughts?",
        "Anxiety can feel incredibly overwhelming, but remember that you are safe in this moment. Try to focus on the physical contact of your feet on the floor. Would you like to talk about what's worrying you?"
    ],
    stressed: [
        "I hear you. Stress can cloud everything. Since your energy level is current set to {energy}, remember that you don't have to carry this burden all at once. Try listing just one thing you can tackle today, or take a few minutes to breathe.",
        "It's okay to feel overwhelmed. Stress is a sign your body needs a moment to rest. Let's try to break things down. What is the single biggest thing on your mind right now?"
    ],
    sad: [
        "I'm so sorry you're feeling down. Please remember that your feelings are completely valid, and it's okay to feel sad. You don't have to pretend to be strong here. What do you feel is making you feel this way?",
        "When things feel heavy, remember to be gentle with yourself. Taking one small step—like having a warm drink, taking a shower, or resting—is a huge victory. I'm here to listen if you want to write it out."
    ],
    tired: [
        "Exhaustion is your body's way of asking for care. Especially with your energy marked as {energy}, I highly recommend taking a break today. What is one obligation you can step away from to give yourself rest?",
        "It sounds like you are running on empty. Remember that rest is productive. Give yourself permission to disconnect for a bit. Can you take a warm bath or get to bed early tonight?"
    ],
    suicide: [
        "**Please know that you are not alone and your life has immense value.** I want you to be safe. Please reach out to someone who can help you right now.\n\n" +
        "📞 **Call or text 988** to reach the Suicide & Crisis Lifeline (US & Canada) — free, confidential, and available 24/7.\n" +
        "📱 **Text HOME to 741741** to connect with the Crisis Text Line.\n" +
        "🌍 For international resources, please visit [Find A Helpline](https://findahelpline.com).\n\n" +
        "Please connect with a professional or contact someone you trust immediately."
    ],
    thanks: [
        "You are so welcome! Taking care of your mental well-being is a journey, and I'm glad to walk a part of it with you.",
        "Of course! I'm always here whenever you need a safe space to chat or breathe. Take care of yourself."
    ],
    advice: [
        "When looking for guidance, starting with small, manageable actions can help ground you. Try these steps:\n* **Focus on your breath**: Use our 4-7-8 breathing circle in the left sidebar.\n* **Physical comfort**: Have a warm drink, wrap up in a blanket, or step outside for fresh air.\n* **Grounding**: Focus on 3 things you can see and hear right now.\n\nWould you like to explore one of these, or is there a specific issue you want advice on?",
        "If you're feeling stuck, taking a step back is very helpful. I suggest taking a short 5-minute break away from screens, relaxing your posture, and drinking some water. We can chat about what's going on when you feel ready."
    ],
    default: [
        "Thank you for sharing that with me. It takes courage to open up. Tell me more about how that makes you feel.",
        "I'm tuning in. That sounds like a lot to hold. How are you coping with it currently?",
        "I hear you, and I'm here for you. What is one small thing that usually brings you comfort when you feel this way?"
    ]
};

// Default initial chat log
const defaultChatLog = [
    { role: "assistant", content: "Hi! I am your wellness companion. How are you feeling today? You can select your mood on the left to adapt the theme, choose your stress/energy levels above, or write down your thoughts below." }
];

/* ==========================================
   DOM Elements
   ========================================== */
const particleContainer = document.getElementById("particle-container");
const moodBtns = document.querySelectorAll(".mood-btn");
const breathingCircle = document.getElementById("breathing-circle");
const breathingTimerText = document.getElementById("breathing-timer-text");
const breathingInstruction = document.getElementById("breathing-instruction");
const breathingToggleBtn = document.getElementById("breathing-toggle-btn");
const aiModeToggle = document.getElementById("ai-mode-toggle");
const apiKeyContainer = document.getElementById("api-key-container");
const geminiApiKeyInput = document.getElementById("gemini-api-key");
const dailyTipText = document.getElementById("daily-tip");
const botStatusText = document.getElementById("bot-status");
const stressLevelSelect = document.getElementById("stress-level");
const energyLevelSelect = document.getElementById("energy-level");
const chatMessagesLog = document.getElementById("chat-messages-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const geminiModelSelect = document.getElementById("gemini-model");

/* ==========================================
   Initialization
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Generate background particles
    createParticles();

    // Load saved settings
    loadSettings();

    // Render initial messages
    renderChatLog();

    // Set a random daily self-care tip
    updateDailyTip("calm");

    // Add Event Listeners
    setupEventListeners();
});

/* ==========================================
   Background Particles Generator
   ========================================== */
function createParticles() {
    particleContainer.innerHTML = "";
    const particleCount = window.innerWidth < 768 ? 8 : 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        
        // Random dimensions
        const size = Math.random() * 40 + 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random positions
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random delays and durations
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${Math.random() * 15 + 15}s`;
        
        particleContainer.appendChild(particle);
    }
}

/* ==========================================
   Local Storage & Settings Managers
   ========================================== */
function loadSettings() {
    // 1. Theme/Mood
    const savedMood = localStorage.getItem("wellness-mood") || "calm";
    setActiveMood(savedMood);

    // 2. AI Mode configuration
    const savedAiMode = localStorage.getItem("wellness-ai-mode") === "true";
    aiModeToggle.checked = savedAiMode;
    toggleApiKeyInput(savedAiMode);
    updateBotStatus();

    // 3. API Key
    const savedApiKey = localStorage.getItem("wellness-gemini-key") || "";
    geminiApiKeyInput.value = savedApiKey;

    // 4. Stress and Energy Levels
    const savedStress = localStorage.getItem("wellness-stress") || "Moderate";
    stressLevelSelect.value = savedStress;
    const savedEnergy = localStorage.getItem("wellness-energy") || "Moderate";
    energyLevelSelect.value = savedEnergy;

    // 5. Saved Model
    const savedModel = localStorage.getItem("wellness-gemini-model") || "gemini-3.5-flash";
    if (geminiModelSelect) geminiModelSelect.value = savedModel;
}

function saveSettings() {
    localStorage.setItem("wellness-ai-mode", aiModeToggle.checked);
    localStorage.setItem("wellness-gemini-key", geminiApiKeyInput.value);
    localStorage.setItem("wellness-stress", stressLevelSelect.value);
    localStorage.setItem("wellness-energy", energyLevelSelect.value);
    if (geminiModelSelect) {
        localStorage.setItem("wellness-gemini-model", geminiModelSelect.value);
    }
}

/* ==========================================
   Mood Tracker Theme Logic
   ========================================== */
function setActiveMood(mood) {
    // Remove active class from all buttons
    moodBtns.forEach(btn => btn.classList.remove("active"));
    
    // Find matching button and activate
    const matchingBtn = document.querySelector(`.mood-btn[data-mood="${mood}"]`);
    if (matchingBtn) matchingBtn.classList.add("active");
    
    // Update body theme class
    document.body.className = "";
    document.body.classList.add(`theme-${mood}`);
    
    // Save to local storage
    localStorage.setItem("wellness-mood", mood);
    
    // Update tips dynamically
    updateDailyTip(mood);
}

function updateDailyTip(mood) {
    const tips = moodTips[mood] || moodTips.calm;
    const randomIndex = Math.floor(Math.random() * tips.length);
    dailyTipText.style.opacity = 0;
    setTimeout(() => {
        dailyTipText.innerText = `"${tips[randomIndex]}"`;
        dailyTipText.style.opacity = 1;
        dailyTipText.style.transition = "opacity 0.5s ease";
    }, 200);
}

/* ==========================================
   Breathing Exercise Guide (4-7-8 Method)
   ========================================== */
function toggleBreathingSession() {
    if (isBreathingRunning) {
        stopBreathing();
    } else {
        startBreathing();
    }
}

function startBreathing() {
    isBreathingRunning = true;
    breathingToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Session';
    breathingToggleBtn.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    runBreathingCycle();
}

function stopBreathing() {
    isBreathingRunning = false;
    clearTimeout(breathingCycleTimeout);
    clearInterval(breathingInterval);
    
    // Reset breathing visuals
    breathingCircle.className = "breathing-circle";
    breathingTimerText.innerText = "Click Start";
    breathingInstruction.innerText = "Inhale peace, exhale tension.";
    
    breathingToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Session';
    // Restore theme accent gradient background
    breathingToggleBtn.style.background = "";
}

function runBreathingCycle() {
    if (!isBreathingRunning) return;

    let seconds = 0;
    
    // Phase 1: Inhale (4s)
    breathingCircle.className = "breathing-circle inhale";
    breathingInstruction.innerText = "Breathe in through your nose deeply...";
    
    seconds = 4;
    breathingTimerText.innerText = seconds;
    
    breathingInterval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            breathingTimerText.innerText = seconds;
        } else {
            clearInterval(breathingInterval);
        }
    }, 1000);

    // Phase 2: Hold (7s)
    breathingCycleTimeout = setTimeout(() => {
        if (!isBreathingRunning) return;
        
        breathingCircle.className = "breathing-circle hold";
        breathingInstruction.innerText = "Hold your breath calmly...";
        
        seconds = 7;
        breathingTimerText.innerText = seconds;
        
        breathingInterval = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                breathingTimerText.innerText = seconds;
            } else {
                clearInterval(breathingInterval);
            }
        }, 1000);
        
        // Phase 3: Exhale (8s)
        breathingCycleTimeout = setTimeout(() => {
            if (!isBreathingRunning) return;
            
            breathingCircle.className = "breathing-circle exhale";
            breathingInstruction.innerText = "Exhale slowly through your mouth, letting go...";
            
            seconds = 8;
            breathingTimerText.innerText = seconds;
            
            breathingInterval = setInterval(() => {
                seconds--;
                if (seconds > 0) {
                    breathingTimerText.innerText = seconds;
                } else {
                    clearInterval(breathingInterval);
                }
            }, 1000);
            
            // Loop Cycle
            breathingCycleTimeout = setTimeout(() => {
                runBreathingCycle();
            }, 8000);
            
        }, 7000);
        
    }, 4000);
}

/* ==========================================
   Chat Interface Managers
   ========================================== */
function toggleApiKeyInput(show) {
    if (show) {
        apiKeyContainer.classList.remove("hidden");
    } else {
        apiKeyContainer.classList.add("hidden");
    }
}

function updateBotStatus() {
    const isAi = aiModeToggle.checked;
    if (isAi) {
        botStatusText.innerHTML = '<span class="status-dot" style="background-color: #3b82f6; box-shadow: 0 0 8px #3b82f6;"></span> Advanced AI Active';
    } else {
        botStatusText.innerHTML = '<span class="status-dot"></span> Empathetic Mode';
    }
}

function getChatLog() {
    const log = localStorage.getItem("wellness-chat-log");
    return log ? JSON.parse(log) : defaultChatLog;
}

function saveChatLog(log) {
    localStorage.setItem("wellness-chat-log", JSON.stringify(log));
}

function renderChatLog() {
    chatMessagesLog.innerHTML = "";
    const log = getChatLog();
    
    log.forEach(msg => {
        appendMessageToDom(msg.role, msg.content);
    });
    
    scrollToBottom();
}

function appendMessageToDom(role, content) {
    const msgElement = document.createElement("div");
    msgElement.className = `chat-msg ${role}`;
    
    const avatar = role === "user" ? "👤" : "🌱";
    
    // Parse basic markdown-style items like bold and links for a cleaner look
    const formattedContent = parseSimpleMarkdown(content);

    msgElement.innerHTML = `
        <div class="msg-avatar">${avatar}</div>
        <div class="msg-bubble">
            <div class="${role}-msg-container">${formattedContent}</div>
        </div>
    `;
    
    chatMessagesLog.appendChild(msgElement);
}

function scrollToBottom() {
    chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;
}

function parseSimpleMarkdown(text) {
    if (!text) return "";
    
    // Escape HTML tags to prevent XSS
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
        
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Bullet points: \n* list item
    html = html.replace(/^\*\s(.*)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
    
    // Line breaks
    html = html.replace(/\n/g, "<br>");
    
    return html;
}

/* ==========================================
   Chatbot Response Core (Local / API)
   ========================================== */
function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "chat-msg assistant typing-loader";
    indicator.innerHTML = `
        <div class="msg-avatar">🌱</div>
        <div class="msg-bubble">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    chatMessagesLog.appendChild(indicator);
    scrollToBottom();
    return indicator;
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const prompt = chatInput.value.trim();
    if (!prompt) return;
    
    chatInput.value = "";
    
    // 1. Add user message to UI log and state
    const chatLog = getChatLog();
    chatLog.push({ role: "user", content: prompt });
    saveChatLog(chatLog);
    appendMessageToDom("user", prompt);
    scrollToBottom();
    
    // 2. Show bot typing loader
    const indicator = showTypingIndicator();
    
    // 3. Resolve context parameters
    const stress = stressLevelSelect.value;
    const energy = energyLevelSelect.value;
    
    // 4. Get response (Local or Gemini API)
    let reply = "";
    const isAi = aiModeToggle.checked;
    const apiKey = geminiApiKeyInput.value.trim();
    
    if (isAi && apiKey) {
        reply = await fetchGeminiResponse(prompt, apiKey, stress, energy);
    } else {
        reply = getLocalResponse(prompt, stress, energy);
    }
    
    // 5. Remove loader and display reply
    indicator.remove();
    chatLog.push({ role: "assistant", content: reply });
    saveChatLog(chatLog);
    appendMessageToDom("assistant", reply);
    scrollToBottom();
}

// Empathetic client-side Local Responder (Rogerian Active-Listening Engine)
function getLocalResponse(prompt, stress, energy) {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    // 1. Crisis Check
    if (lowerPrompt.match(/\b(suicide|kill|harm|die|end my life|cut myself)\b/)) {
        return localResponses.suicide[0];
    }
    
    // 2. Greeting Check
    if (lowerPrompt.match(/\b(hello|hi|hey|greetings|howdy)\b/) && lowerPrompt.length < 12) {
        const greetings = localResponses.greetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Helper function to mirror pronouns (e.g., "I feel sad about my exams" -> "you feel sad about your exams")
    function mirrorPronouns(phrase) {
        // Handle common punctuation spacing
        let text = phrase.replace(/([.,!?;:])/g, " $1 ");
        let words = text.split(/\s+/);
        let mirrored = words.map(word => {
            let cleanWord = word.toLowerCase();
            switch (cleanWord) {
                case "i": return "you";
                case "am": return "are";
                case "my": return "your";
                case "me": return "you";
                case "myself": return "yourself";
                case "mine": return "yours";
                case "i'm": return "you're";
                case "we": return "you";
                case "us": return "you";
                case "our": return "your";
                case "was": return "were";
                default: return word;
            }
        });
        // Join and clean up punctuation spacing
        return mirrored.join(" ")
            .replace(/\s+([.,!?;:])/g, "$1")
            .replace(/\s+/g, " ")
            .trim();
    }
    
    // 3. Mirroring Statements ("I feel X", "I am X", "I'm X")
    let feelMatch = prompt.match(/i feel\s+([^.!?]+)/i) || prompt.match(/i'm\s+([^.!?]+)/i) || prompt.match(/i am\s+([^.!?]+)/i);
    if (feelMatch) {
        let feeling = feelMatch[1].trim();
        let mirrored = mirrorPronouns(feeling);
        
        const reflections = [
            `I hear you, and it makes complete sense that you feel ${mirrored}. Thank you for trusting me with this. What do you think is contributing most to this feeling?`,
            `Carrying that feeling of being ${mirrored} sounds like a lot to hold today. How is it affecting your energy and focus right now?`,
            `I'm listening, and I want to validate that feeling ${mirrored} is completely okay. Can you tell me a bit more about what brought this on?`,
            `Thank you for sharing that you are ${mirrored}. When you feel this way, what is one small thing that usually helps you feel even a tiny bit safer or more comfortable?`
        ];
        return reflections[Math.floor(Math.random() * reflections.length)];
    }
    
    // 4. Mirroring Thoughts / Desires ("I think X", "I want X", "I wish X")
    let thoughtMatch = prompt.match(/i think\s+([^.!?]+)/i) || prompt.match(/i want\s+([^.!?]+)/i) || prompt.match(/i wish\s+([^.!?]+)/i);
    if (thoughtMatch) {
        let thought = thoughtMatch[0].trim();
        let mirrored = mirrorPronouns(thought);
        
        const thoughtReflections = [
            `It sounds like ${mirrored}. What makes you feel that way right now?`,
            `I appreciate you sharing that. Hearing that ${mirrored} sounds like there's a lot on your mind. How does this affect you day-to-day?`,
            `When you think about that, what is the main emotion that comes up for you?`
        ];
        return thoughtReflections[Math.floor(Math.random() * thoughtReflections.length)];
    }

    // 5. Keyword Matches
    if (lowerPrompt.match(/\b(anxious|anxiety|scared|worry|panic|fear)\b/)) {
        return "It sounds like you're dealing with a wave of anxiety right now. Anxiety is a very physical feeling—your heart might be racing or your chest might feel tight. Let's take a slow breath together. Would you like to talk about what triggered this?";
    }
    if (lowerPrompt.match(/\b(stressed|stress|overwhelm|pressure|busy|exam)\b/)) {
        return `I hear how much pressure you're under. Dealing with stress while your energy is ${energy.toLowerCase()} can feel like trying to run on empty. What is one small task we can set aside for tomorrow to give you some breathing room today?`;
    }
    if (lowerPrompt.match(/\b(sad|depressed|cry|lonely|grief|broken|empty)\b/)) {
        return "I'm holding space for you. Feeling sad or lonely is heavy, and it's okay to let yourself feel it rather than push it away. You don't have to go through it alone. What has been the hardest part of today for you?";
    }
    if (lowerPrompt.match(/\b(thank|thanks|grateful|appreciate)\b/)) {
        const thanks = localResponses.thanks;
        return thanks[Math.floor(Math.random() * thanks.length)];
    }
    if (lowerPrompt.match(/\b(help|cope|advice|tips|what should i do|how to|suggest|guidance|exercise|activity)\b/)) {
        const advice = localResponses.advice;
        return advice[Math.floor(Math.random() * advice.length)];
    }
    
    // 6. Default Fallback Reflections (Rogerian Style)
    const defaultReflections = [
        "That sounds like a lot to carry. If you feel comfortable, could you share a bit more about what's been happening?",
        "I'm listening. How has this been affecting your sleep or your daily peace of mind?",
        "It sounds like there are several layers to what you're experiencing. What do you feel is the most important thing to focus on or unpack first?",
        "Thank you for trusting me with this. How can I best support you in this moment—do you want to talk it through, or would you like to try a grounding exercise?"
    ];
    return defaultReflections[Math.floor(Math.random() * defaultReflections.length)];
}

// Client-side Direct API call to Gemini
async function fetchGeminiResponse(userPrompt, apiKey, stress, energy) {
    const systemPrompt = 
        "You are a warm, compassionate, non-judgmental mental wellness companion. " +
        "Converse like an understanding human friend or empathetic counselor, not a rigid robot. " +
        "Follow these rules for human-like responses:\n" +
        "1. Always validate their feelings or acknowledge what they said with genuine empathy first.\n" +
        "2. Keep your replies conversational and concise. Do not dump large walls of text or long lists of bullets unless requested.\n" +
        "3. Avoid robotic patterns or repeating generic catchphrases (like 'I'm here for you' or 'How can I assist you today') at the start/end of every message.\n" +
        "4. Adapt your tone to their stress and energy context (e.g., offer slower, gentler, and more soothing responses when stress is High).\n" +
        "5. Speak in the first person and show active listening by referencing their specific details.\n" +
        "6. If the user discusses severe crisis, self-harm, or despair, prioritize safety by providing official support services (like calling or texting 988) in a gentle, warm way.";
        
    const chatLog = getChatLog();
    
    // Build context-rich prompt for Gemini including current selections
    const enrichedPrompt = `[User Context: Stress level is ${stress}, Energy level is ${energy}] ${userPrompt}`;
    
    // Map previous logs into Gemini API format (limit history to last 10 messages for speed)
    const formattedContents = [];
    const maxHistory = Math.max(0, chatLog.length - 10);
    
    for (let i = maxHistory; i < chatLog.length - 1; i++) {
        const msg = chatLog[i];
        formattedContents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        });
    }
    
    // Append the final current message
    formattedContents.push({
        role: "user",
        parts: [{ text: enrichedPrompt }]
    });

    try {
        const modelName = geminiModelSelect ? geminiModelSelect.value : "gemini-3.5-flash";
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: formattedContents,
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    }
                })
            }
        );
        
        if (!response.ok) {
            const errData = await response.json();
            console.error("Gemini API Error details:", errData);
            if (errData.error && errData.error.message.includes("quota")) {
                return "⚠️ **Gemini API Quota Exceeded.** I cannot connect to the advanced AI. Please switch to **Empathetic Mode** (toggle off 'Advanced AI Mode' in the settings) or check your API key details.";
            }
            return `⚠️ **Gemini Connection Error (${response.status})**: ${errData.error?.message || "Failed to retrieve response."}`;
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (e) {
        console.error("Gemini Fetch Network Error:", e);
        return "⚠️ **Network Error**: Unable to reach Google API servers. Please check your internet connection.";
    }
}

/* ==========================================
   Event Listeners Setup
   ========================================== */
function setupEventListeners() {
    // Mood tracker buttons click
    moodBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const mood = btn.getAttribute("data-mood");
            setActiveMood(mood);
        });
    });

    // Breathing guide button click
    breathingToggleBtn.addEventListener("click", toggleBreathingSession);

    // AI Mode Switch toggle
    aiModeToggle.addEventListener("change", () => {
        const isAi = aiModeToggle.checked;
        toggleApiKeyInput(isAi);
        saveSettings();
        updateBotStatus();
    });

    // Input fields change
    geminiApiKeyInput.addEventListener("input", saveSettings);
    stressLevelSelect.addEventListener("change", saveSettings);
    energyLevelSelect.addEventListener("change", saveSettings);
    if (geminiModelSelect) {
        geminiModelSelect.addEventListener("change", saveSettings);
    }

    // Chat submit form
    chatForm.addEventListener("submit", handleChatSubmit);
    
    // Generate new background particles on resize
    window.addEventListener("resize", createParticles);
}
