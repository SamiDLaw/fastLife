# FastLife

Application web permettant de découvrir des lieux et événements intéressants autour de vous. Avec une interface intuitive basée sur une carte interactive, FastLife vous aide à trouver des restaurants, bars, musées, et bien plus encore.

## Fonctionnalités

- Carte interactive avec différentes catégories de lieux
- Détails complets sur chaque lieu (horaires, adresse, site web, etc.)
- Chatbot IA pour répondre à vos questions
- Interface responsive adaptée à tous les appareils

## Installation locale

1. Cloner le dépôt
   ```bash
   git clone https://github.com/SamiDLaw/fastLife.git
   cd fastLife
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   ```bash
   cp .env.example .env
   # Modifier le fichier .env avec vos propres clés API
   ```

4. Démarrer l'application
   ```bash
   npm start
   ```

## Déploiement sur Render

### Prérequis

- Un compte [Render](https://render.com/)
- Un compte [GitHub](https://github.com/) avec votre code
- Un nom de domaine (optionnel, par exemple acheté sur OVH)

### Étapes de déploiement

1. **Connectez-vous à Render**
   - Créez un compte sur [Render](https://render.com/) ou connectez-vous

2. **Créez un nouveau service Web**
   - Cliquez sur "New +" puis "Web Service"
   - Connectez votre dépôt GitHub
   - Sélectionnez le dépôt fastLife

3. **Configurez le service**
   - Nom : `fastlife` (ou le nom de votre choix)
   - Environnement : `Node`
   - Build Command : `npm install`
   - Start Command : `npm start`
   - Plan : `Free`

4. **Configurez les variables d'environnement**
   - Ajoutez toutes les variables de votre fichier `.env` dans la section "Environment Variables"
   - Assurez-vous d'ajouter `NODE_ENV=production`

5. **Déployez**
   - Cliquez sur "Create Web Service"
   - Attendez que le déploiement soit terminé

### Association avec un nom de domaine OVH

1. **Achetez un nom de domaine sur OVH**
   - Rendez-vous sur [OVH](https://www.ovh.com/)
   - Achetez le nom de domaine de votre choix

2. **Configurez les DNS**
   - Dans votre espace client OVH, allez dans la section DNS de votre domaine
   - Ajoutez un enregistrement CNAME pointant vers votre domaine Render
     - Type : `CNAME`
     - Nom : `www` (ou `@` pour le domaine racine)
     - Cible : `votre-app.onrender.com` (l'URL fournie par Render)
     - TTL : `3600`

3. **Configurez le domaine personnalisé dans Render**
   - Dans votre tableau de bord Render, allez dans les paramètres de votre service
   - Cliquez sur "Custom Domains"
   - Ajoutez votre domaine (ex: `www.votredomaine.com`)
   - Suivez les instructions pour vérifier la propriété du domaine

4. **Activez HTTPS**
   - Render configurera automatiquement un certificat SSL/TLS gratuit via Let's Encrypt

## Technologies utilisées

- Node.js et Express
- Twig pour les templates
- Leaflet pour la carte interactive
- OpenStreetMap pour les données géographiques
- OpenAI API pour le chatbot

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

ISC
