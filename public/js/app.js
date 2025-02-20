//public/js/app.js

document.addEventListener('DOMContentLoaded', function () {
    const accountIcon = document.querySelector('.account-icon');
    const navbar = document.querySelector('.navbar');
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    
    // Toggle la classe active sur la navbar quand on clique sur l'icône de compte
    accountIcon.addEventListener('click', function (event) {
        event.stopPropagation(); // Empêche le clic de se propager pour éviter de fermer immédiatement la navbar
        navbar.classList.toggle('active');
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    // Ferme la navbar si on clique en dehors d'elle
    document.addEventListener('click', function (event) {
        if (!navbar.contains(event.target) && !accountIcon.contains(event.target)) {
            navbar.classList.remove('active');
        }
    });
});