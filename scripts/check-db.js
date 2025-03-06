// scripts/check-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Vérification de la base de données...');
    
    // Vérifier les catégories
    const categoriesCount = await prisma.category.count();
    console.log(`Nombre de catégories: ${categoriesCount}`);
    
    // Vérifier les questions
    const questionsCount = await prisma.question.count();
    console.log(`Nombre de questions: ${questionsCount}`);
    
    // Vérifier les options
    const optionsCount = await prisma.option.count();
    console.log(`Nombre d'options: ${optionsCount}`);
    
    // Afficher les détails des questions et options
    const questions = await prisma.question.findMany({
      include: {
        options: true,
        category: true
      }
    });
    
    console.log('\nDétails des questions:');
    questions.forEach((question, index) => {
      console.log(`\nQuestion ${index + 1}: ${question.text}`);
      console.log(`Catégorie: ${question.category.name}`);
      console.log(`Options (${question.options.length}):`);
      question.options.forEach(option => {
        console.log(`- ${option.text} (ID: ${option.id}, Image: ${option.imagePath || 'Non définie'})`);
      });
    });
    
    console.log('\nVérification terminée!');
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
