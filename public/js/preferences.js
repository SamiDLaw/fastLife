document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('preferencesForm');
    const progressBar = document.querySelector('.progress-bar');
    const submitButton = document.querySelector('.submit-button');
    const errorMessage = document.getElementById('errorMessage');
    const optionItems = document.querySelectorAll('.option-item');
    const sections = document.querySelectorAll('.preference-section');
    
    let selectedOptions = new Map(); // Map pour stocker les options sélectionnées par question
    
    // Initialiser la Map avec les options déjà sélectionnées
    optionItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            const questionId = item.closest('.preference-section').dataset.questionId;
            if (!selectedOptions.has(questionId)) {
                selectedOptions.set(questionId, new Set());
            }
            selectedOptions.get(questionId).add(checkbox.value);
        }
    });
    
    // Mettre à jour la barre de progression
    function updateProgress() {
        const totalQuestions = sections.length;
        let answeredQuestions = 0;
        
        selectedOptions.forEach((options, questionId) => {
            if (options.size > 0) answeredQuestions++;
        });
        
        const progress = answeredQuestions / totalQuestions;
        progressBar.style.transform = `scaleX(${progress})`;
        
        // Activer le bouton si toutes les questions ont au moins une réponse
        submitButton.disabled = answeredQuestions < totalQuestions;
        submitButton.classList.toggle('ready', answeredQuestions === totalQuestions);
    }
    
    // Gérer la sélection des options
    optionItems.forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            const questionId = this.closest('.preference-section').dataset.questionId;
            
            // Initialiser le Set pour cette question si nécessaire
            if (!selectedOptions.has(questionId)) {
                selectedOptions.set(questionId, new Set());
            }
            
            // Gérer la sélection/désélection
            if (checkbox.checked) {
                selectedOptions.get(questionId).delete(checkbox.value);
                this.classList.remove('selected');
                checkbox.checked = false;
            } else {
                selectedOptions.get(questionId).add(checkbox.value);
                this.classList.add('selected');
                checkbox.checked = true;
            }
            
            updateProgress();
        });
    });
    
    // Gérer la soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Vérifier que toutes les questions ont au moins une réponse
        let isValid = true;
        sections.forEach(section => {
            const questionId = section.dataset.questionId;
            if (!selectedOptions.has(questionId) || selectedOptions.get(questionId).size === 0) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            errorMessage.textContent = "Veuillez répondre à toutes les questions avant de continuer.";
            return;
        }
        
        errorMessage.textContent = "";
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(form);
            const response = await fetch('/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    preferences: Array.from(formData.getAll('preferences[]'))
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde des préférences');
            }
            
            const data = await response.json();
            if (data.success) {
                window.location.href = data.redirectUrl || '/recommendations';
            } else {
                throw new Error(data.message || 'Erreur lors de la sauvegarde des préférences');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            submitButton.disabled = false;
        }
    });
    
    // Initialiser la progression
    updateProgress();
});