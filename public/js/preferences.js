//public/js/preferences.js


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("preferencesForm");
    const submitButton = document.querySelector(".submit-button");
    const sections = document.querySelectorAll(".preference-section");
    const progressBar = document.getElementById("progressBar");
    const errorMessage = document.getElementById("errorMessage");
    let currentSectionIndex = 0;

    // Fonction pour mettre à jour la barre de progression et le bouton de soumission
    function updateProgressAndSubmitButton() {
        const totalSections = sections.length;
        let completedSections = 0;

        sections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            const isCompleted = Array.from(checkboxes).some(cb => cb.checked);
            if (isCompleted) completedSections++;
        });

        const progress = (completedSections / totalSections) * 100;
        progressBar.style.transform = `scaleX(${progress / 100})`;

        if (completedSections === totalSections) {
            submitButton.disabled = false;
            submitButton.classList.add("ready");
        } else {
            submitButton.disabled = true;
            submitButton.classList.remove("ready");
        }
    }

    // Ajouter des animations fluides aux options
    document.querySelectorAll(".option-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const checkbox = item.querySelector('input[type="checkbox"]');
            
            // Animation de sélection
            item.style.transform = "scale(0.95)";
            setTimeout(() => {
                item.style.transform = "scale(1)";
                checkbox.checked = !checkbox.checked;
                item.classList.toggle("selected");
                
                // Effet de vague
                const ripple = document.createElement("div");
                ripple.classList.add("ripple");
                item.appendChild(ripple);
                setTimeout(() => ripple.remove(), 1000);
                
                updateProgressAndSubmitButton();
                
                // Passer automatiquement à la section suivante si une option est sélectionnée
                if (checkbox.checked) {
                    setTimeout(() => {
                        const nextSection = sections[currentSectionIndex + 1];
                        if (nextSection) {
                            nextSection.scrollIntoView({ behavior: "smooth" });
                            currentSectionIndex++;
                        }
                    }, 500);
                }
            }, 100);
        });
    });

    // Gérer la soumission du formulaire
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const allSectionsCompleted = Array.from(sections).every(section => {
            return Array.from(section.querySelectorAll('input[type="checkbox"]')).some(cb => cb.checked);
        });

        if (allSectionsCompleted) {
            submitButton.innerHTML = '<span class="spinner"></span>';
            submitButton.disabled = true;

            try {
                // Récupérer toutes les options sélectionnées
                const selectedOptions = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(cb => cb.value);

                const response = await fetch('/preferences', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        preferences: selectedOptions
                    })
                });

                if (response.ok) {
                    submitButton.innerHTML = '✓ Préférences enregistrées';
                    submitButton.classList.add("success");
                    setTimeout(() => {
                        window.location.href = '/map';
                    }, 1000);
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Erreur lors de l\'enregistrement');
                }
            } catch (error) {
                submitButton.innerHTML = 'Réessayer';
                submitButton.disabled = false;
                submitButton.classList.add("error");
                if (errorMessage) {
                    errorMessage.textContent = error.message || "Une erreur est survenue. Veuillez réessayer.";
                    errorMessage.style.display = "block";
                    setTimeout(() => {
                        errorMessage.style.display = "none";
                    }, 5000);
                }
            }
        } else {
            if (errorMessage) {
                errorMessage.textContent = "Veuillez sélectionner au moins une option pour chaque question.";
                errorMessage.style.display = "block";
                setTimeout(() => {
                    errorMessage.style.display = "none";
                }, 5000);
            }
        }
    });

    // Initialiser l'état
    updateProgressAndSubmitButton();

    // Ajouter des styles CSS pour les animations
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple 1s linear;
            pointer-events: none;
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .submit-button.success {
            background-color: #34C759 !important;
        }

        .submit-button.error {
            background-color: #FF3B30 !important;
        }

        .submit-button.ready {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        #errorMessage {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #FF3B30;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            display: none;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from {
                transform: translate(-50%, -100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});