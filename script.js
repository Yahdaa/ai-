class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearChat');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.initializeEventListeners();
        this.autoResizeTextarea();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.clearButton.addEventListener('click', () => this.clearChat());
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.sendButton.disabled = true;

        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', 'ai');
            console.error('Error:', error);
        }

        this.sendButton.disabled = false;
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = this.chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    async getAIResponse(message) {
        // Using Hugging Face Inference API (free tier)
        const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: message,
                    parameters: {
                        max_length: 100,
                        temperature: 0.7,
                        do_sample: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                // If model is loading, try alternative approach
                if (data.error.includes('loading')) {
                    return this.getFallbackResponse(message);
                }
                throw new Error(data.error);
            }

            return data.generated_text || data[0]?.generated_text || this.getFallbackResponse(message);
            
        } catch (error) {
            console.error('Hugging Face API error:', error);
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        const responses = [
            "¡Interesante! Cuéntame más sobre eso.",
            "Entiendo tu punto. ¿Qué opinas sobre esto?",
            "Esa es una buena pregunta. Déjame pensar...",
            "Me parece fascinante lo que dices.",
            "¿Podrías explicarme más detalles?",
            "Eso suena muy interesante. ¿Cómo llegaste a esa conclusión?",
            "Gracias por compartir eso conmigo.",
            "¡Qué perspectiva tan única!",
            "Me gustaría saber más sobre tu experiencia con eso.",
            "Esa es una excelente observación."
        ];
        
        // Simple keyword-based responses
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
            return "¡Hola! ¿Cómo estás hoy? ¿En qué puedo ayudarte?";
        }
        
        if (lowerMessage.includes('gracias')) {
            return "¡De nada! Estoy aquí para ayudarte en lo que necesites.";
        }
        
        if (lowerMessage.includes('adiós') || lowerMessage.includes('bye')) {
            return "¡Hasta luego! Que tengas un excelente día.";
        }
        
        if (lowerMessage.includes('cómo estás')) {
            return "¡Estoy muy bien, gracias por preguntar! ¿Cómo estás tú?";
        }
        
        if (lowerMessage.includes('nombre')) {
            return "Soy tu asistente de IA. Puedes llamarme como gustes. ¿Cuál es tu nombre?";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">✨</div>
                <h2>¡Bienvenido a AI Chat!</h2>
                <p>Chatea con IA gratuita. Escribe tu mensaje abajo para comenzar.</p>
            </div>
        `;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

// Add some visual effects
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) {
        const cursorDiv = document.createElement('div');
        cursorDiv.className = 'cursor';
        cursorDiv.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursorDiv);
    }
    
    const cursorElement = document.querySelector('.cursor');
    cursorElement.style.left = e.clientX - 10 + 'px';
    cursorElement.style.top = e.clientY - 10 + 'px';
});