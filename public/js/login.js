// document.addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.getElementById('login-form');

//     loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;

//         try {
//             const response = await fetch('/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 // Redirection après connexion réussie
//                 window.location.href = '/dashboard';
//             } else {
//                 // Affichage des erreurs
//                 displayErrors(data.errors);
//             }
//         } catch (error) {
//             console.error('Erreur lors de la connexion:', error);
//         }
//     });

//     function displayErrors(errors) {
//         // Effacer les erreurs précédentes
//         document.querySelectorAll('.error').forEach(el => el.textContent = '');

//         // Afficher les nouvelles erreurs
//         for (const [field, message] of Object.entries(errors)) {
//             const errorElement = document.getElementById(`${field}-error`);
//             if (errorElement) {
//                 errorElement.textContent = message;
//             }
//         }
//     }
// });

// function validateEmail(email) {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
// }

// function validatePassword(password) {
//     return password.length >= 8;
// }

// // Ajoutez ces validations dans vos event listeners de formulaire
