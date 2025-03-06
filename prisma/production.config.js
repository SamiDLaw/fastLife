// prisma/production.config.js
module.exports = {
  // Désactive la sécurité des migrations en production pour permettre les migrations sans confirmation
  migrationEngine: {
    allowDirectDatabase: true
  },
  // Augmente le timeout pour les migrations
  migrations: {
    timeout: 120000 // 120 secondes pour donner plus de temps sur Render
  },
  // Configuration de la connexion à la base de données
  datasources: {
    db: {
      // Augmente le pool de connexions pour améliorer les performances
      poolConfig: {
        max: 10, // Maximum de connexions simultanées
        min: 2,  // Minimum de connexions maintenues
        idle: 10000 // Temps d'inactivité avant de fermer une connexion (ms)
      }
    }
  },
  // Optimisation du client Prisma
  client: {
    // Activer le cache des requêtes pour améliorer les performances
    enableQueryCache: true,
    // Réduire les logs en production
    logLevel: 'error'
  }
};
