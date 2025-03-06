/**
 * Chatbot IA pour FastLife
 */
class Chatbot {
    constructor() {
        this.container = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.sendButton = null;
        this.isOpen = false;
        this.conversationHistory = [];
        this.isWaitingForResponse = false;
        
        // Initialiser le chatbot après le chargement du DOM
        document.addEventListener('DOMContentLoaded', () => this.init());
    }
    
    /**
     * Initialise le chatbot et ses événements
     */
    init() {
        // Créer l'interface du chatbot
        this.createChatInterface();
        
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // Charger les suggestions de questions
        this.loadSuggestions();
        
        console.log('Chatbot initialisé avec succès');
    }
    
    /**
     * Crée l'interface du chatbot dans le DOM
     */
    createChatInterface() {
        // Créer le conteneur principal
        this.container = document.createElement('div');
        this.container.className = 'chatbot-container';
        
        // Créer l'en-tête
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <h3>Assistant FastLife</h3>
            <button class="chatbot-close">&times;</button>
        `;
        
        // Créer le conteneur des messages
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chatbot-messages';
        
        // Créer le conteneur des suggestions
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestion-chips';
        
        // Créer le formulaire d'entrée
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chatbot-input';
        inputContainer.innerHTML = `
            <input type="text" placeholder="Posez votre question..." aria-label="Message">
            <button type="button" aria-label="Envoyer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                </svg>
            </button>
        `;
        
        // Assembler les éléments
        this.container.appendChild(header);
        this.container.appendChild(this.messagesContainer);
        this.container.appendChild(suggestionsContainer);
        this.container.appendChild(inputContainer);
        
        // Ajouter au DOM
        document.body.appendChild(this.container);
        
        // Stocker les références aux éléments
        this.inputField = inputContainer.querySelector('input');
        this.sendButton = inputContainer.querySelector('button');
        this.suggestionsContainer = suggestionsContainer;
        
        // Ajouter le message de bienvenue
        this.addBotMessage("Bonjour ! Je suis l'assistant FastLife. Comment puis-je vous aider aujourd'hui ?");
    }
    
    /**
     * Ajoute les écouteurs d'événements
     */
    addEventListeners() {
        // Bouton GPT pour ouvrir/fermer le chatbot
        const gptButton = document.querySelector('.gpt-button');
        if (gptButton) {
            gptButton.addEventListener('click', () => this.toggleChatbot());
        }
        
        // Bouton de fermeture
        const closeButton = this.container.querySelector('.chatbot-close');
        closeButton.addEventListener('click', () => this.toggleChatbot(false));
        
        // Envoi du message par clic sur le bouton
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Envoi du message par appui sur Entrée
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Activer/désactiver le bouton d'envoi en fonction de l'entrée
        this.inputField.addEventListener('input', () => {
            this.sendButton.disabled = this.inputField.value.trim() === '';
        });
    }
    
    /**
     * Charge les suggestions de questions depuis l'API
     */
    async loadSuggestions() {
        try {
            const response = await fetch('/api/chatbot/suggestions');
            const data = await response.json();
            
            if (data.suggestions && data.suggestions.length > 0) {
                this.renderSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
        }
    }
    
    /**
     * Affiche les suggestions de questions
     * @param {Array<string>} suggestions - Liste des suggestions
     */
    renderSuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.addEventListener('click', () => {
                this.inputField.value = suggestion;
                this.sendMessage();
            });
            
            this.suggestionsContainer.appendChild(chip);
        });
    }
    
    /**
     * Ouvre ou ferme le chatbot
     * @param {boolean} [open] - Si défini, force l'état ouvert ou fermé
     */
    toggleChatbot(open) {
        this.isOpen = open !== undefined ? open : !this.isOpen;
        
        // Mettre à jour les classes CSS
        this.container.classList.toggle('active', this.isOpen);
        
        const gptButton = document.querySelector('.gpt-button');
        if (gptButton) {
            gptButton.classList.toggle('active', this.isOpen);
        }
        
        // Si on ouvre le chatbot, focus sur l'input
        if (this.isOpen) {
            setTimeout(() => this.inputField.focus(), 300);
        }
    }
    
    /**
     * Envoie le message de l'utilisateur et obtient une réponse
     */
    async sendMessage() {
        const message = this.inputField.value.trim();
        
        if (message === '' || this.isWaitingForResponse) {
            return;
        }
        
        // Ajouter le message de l'utilisateur à l'interface
        this.addUserMessage(message);
        
        // Vider le champ de saisie
        this.inputField.value = '';
        
        // Désactiver l'envoi pendant l'attente
        this.isWaitingForResponse = true;
        this.sendButton.disabled = true;
        
        // Ajouter l'indicateur de "en train d'écrire"
        this.addThinkingIndicator();
        
        // Ajouter le message à l'historique
        this.conversationHistory.push({ role: 'user', content: message });
        
        try {
            // Envoyer la requête à l'API
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    conversationHistory: this.conversationHistory
                })
            });
            
            const data = await response.json();
            
            // Supprimer l'indicateur de "en train d'écrire"
            this.removeThinkingIndicator();
            
            if (data.response) {
                // Ajouter la réponse du bot à l'interface
                this.addBotMessage(data.response);
                
                // Ajouter la réponse à l'historique
                this.conversationHistory.push({ role: 'assistant', content: data.response });
            } else {
                this.addBotMessage("Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.");
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            this.removeThinkingIndicator();
            this.addBotMessage("Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard.");
        } finally {
            // Réactiver l'envoi
            this.isWaitingForResponse = false;
            this.sendButton.disabled = false;
            this.inputField.focus();
        }
    }
    
    /**
     * Ajoute un message de l'utilisateur à l'interface
     * @param {string} message - Contenu du message
     */
    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.textContent = message;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    /**
     * Ajoute un message du bot à l'interface
     * @param {string} message - Contenu du message
     */
    addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot';
        messageElement.textContent = message;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    /**
     * Ajoute l'indicateur "en train d'écrire"
     */
    addThinkingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message thinking';
        indicator.id = 'thinking-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'thinking-dot';
            indicator.appendChild(dot);
        }
        
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }
    
    /**
     * Supprime l'indicateur "en train d'écrire"
     */
    removeThinkingIndicator() {
        const indicator = document.getElementById('thinking-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    /**
     * Fait défiler la conversation jusqu'en bas
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialiser le chatbot
const chatbot = new Chatbot();
