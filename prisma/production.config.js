// prisma/production.config.js
module.exports = {
  // Désactive la sécurité des migrations en production pour permettre les migrations sans confirmation
  migrationEngine: {
    allowDirectDatabase: true
  },
  // Augmente le timeout pour les migrations
  migrations: {
    timeout: 60000 // 60 secondes
  }
};
