const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

/**
 * Route pour obtenir une réponse du chatbot
 */
router.post('/api/chatbot/message', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Le message est requis' });
        }

        const response = await chatbotService.getResponse(message, conversationHistory || []);
        
        res.json({ response });
    } catch (error) {
        console.error('Erreur lors du traitement de la demande chatbot:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * Route pour obtenir des suggestions de questions
 */
router.get('/api/chatbot/suggestions', (req, res) => {
    try {
        const suggestions = chatbotService.getSuggestions();
        res.json({ suggestions });
    } catch (error) {
        console.error('Erreur lors de la récupération des suggestions:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
