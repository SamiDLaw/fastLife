/**
 * Service pour gérer les interactions avec le chatbot IA
 */
class ChatbotService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-3.5-turbo';
        
        // Contexte initial pour le chatbot
        this.systemPrompt = `Tu es un assistant IA pour l'application FastLife, une application qui aide les utilisateurs à découvrir des lieux et événements intéressants autour d'eux. 
        
        Voici les fonctionnalités principales de FastLife:
        - Affichage de restaurants, cafés, bars, musées, et autres lieux d'intérêt sur une carte
        - Affichage d'événements locaux (concerts, festivals, etc.)
        - Recommandations personnalisées basées sur les préférences de l'utilisateur
        
        Réponds de manière amicale, concise et utile aux questions des utilisateurs. Si tu ne connais pas la réponse à une question spécifique sur l'application, suggère à l'utilisateur de consulter la documentation ou de contacter le support.`;
    }

    /**
     * Envoie une requête à l'API OpenAI pour obtenir une réponse
     * @param {string} userMessage - Message de l'utilisateur
     * @param {Array} conversationHistory - Historique de la conversation
     * @returns {Promise<string>} - Réponse de l'IA
     */
    async getResponse(userMessage, conversationHistory = []) {
        try {
            if (!this.apiKey) {
                return "Je ne peux pas me connecter à mon cerveau en ce moment. Veuillez vérifier la configuration de l'API.";
            }

            // Préparer les messages pour l'API
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...conversationHistory,
                { role: 'user', content: userMessage }
            ];

            // Appel à l'API OpenAI
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Erreur API:', data);
                return `Désolé, j'ai rencontré une erreur: ${data.error?.message || 'Erreur inconnue'}`;
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API:', error);
            return "Désolé, j'ai rencontré une erreur lors de la communication avec mon cerveau. Veuillez réessayer plus tard.";
        }
    }

    /**
     * Obtient des suggestions de questions basées sur le contexte de l'application
     * @returns {Array<string>} - Liste de suggestions de questions
     */
    getSuggestions() {
        return [
            "Comment trouver des restaurants ?",
            "Quels événements sont disponibles ?",
            "Comment fonctionnent les recommandations ?",
            "Comment modifier mes préférences ?"
        ];
    }
}

module.exports = new ChatbotService();
