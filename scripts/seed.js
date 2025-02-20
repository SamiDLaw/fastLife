//scripts/seed.js


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.category.findMany();

    // Si aucune catégorie n'existe, en créer quelques-unes
    if (existingCategories.length === 0) {
        const categories = [
            { name: 'Activités générales' },
            { name: 'Sports' },
            { name: 'Musique' },
            { name: 'Gastronomie' },
            { name: 'Culture' }
        ];

        await prisma.category.createMany({ data: categories });
        console.log('Catégories créées avec succès');
    }

    // Récupérer toutes les catégories
    const allCategories = await prisma.category.findMany();

    const questionsWithOptions = [
        {
            text: "Quels types d'activités vous intéressent le plus ?",
            categoryName: 'Activités générales',
            options: [
                { text: "Sports", imagePath: '/assets/img/options/sports-fitness.jpg' },
                { text: "Arts", imagePath: '/assets/img/options/arts-culture.jpg' },
                { text: "Festivals", imagePath: '/assets/img/options/festivals-musique.jpg' },
                { text: "Gastronomie", imagePath: '/assets/img/options/gastronomie-boissons.jpg' },
                { text: "Nature", imagePath: '/assets/img/options/nature-plein-air.jpg' }
            ]
        },
        {
            text: "Quels sports aimez-vous pratiquer ou regarder ?",
            categoryName: 'Sports',
            options: [
                { text: "Football", imagePath: '/assets/img/options/football.jpg' },
                { text: "Basketball", imagePath: '/assets/img/options/basketball.jpg' },
                { text: "Tennis", imagePath: '/assets/img/options/tennis.jpg' },
                { text: "Natation", imagePath: '/assets/img/options/natation.jpg' }
            ]
        },
        {
            text: "Quel genre de musique préférez-vous écouter ?",
            categoryName: 'Musique',
            options: [
                { text: "Pop", imagePath: '/assets/img/options/pop.jpg' },
                { text: "Rock", imagePath: '/assets/img/options/rock.jpg' },
                { text: "Hip-hop / Rap", imagePath: '/assets/img/options/rap.jpg' },
                { text: "Classique", imagePath: '/assets/img/options/classique.jpg' }
            ]
        },
        {
            text: "Quels types de restaurants aimez-vous ?",
            categoryName: 'Gastronomie',
            options: [
                { text: "Gastronomique", imagePath: '/assets/img/options/cuisine-gastronomique.jpg' },
                { text: "Street-food", imagePath: '/assets/img/options/street-food.jpg' },
                { text: "Végétarien", imagePath: '/assets/img/options/vegetarien.jpg' }
            ]
        },
        {
            text: "Quels types d'événements culturels préférez-vous ?",
            categoryName: 'Culture',
            options: [
                { text: "Expositions d'art", imagePath: '/assets/img/options/expositions-art.jpg' },
                { text: "Festivals de musique", imagePath: '/assets/img/options/festivals-musique.jpg' },
                { text: "Théâtre", imagePath: '/assets/img/options/theatre.jpg' }
            ]
        }
    ];

    for (let questionData of questionsWithOptions) {
        const category = allCategories.find(c => c.name === questionData.categoryName);
        if (!category) {
            console.error(`Catégorie non trouvée : ${questionData.categoryName}`);
            continue;
        }

        await prisma.question.create({
            data: {
                text: questionData.text,
                categoryId: category.id,
                options: {
                    create: questionData.options
                }
            }
        });
        console.log(`Question créée : ${questionData.text}`);
    }

    console.log('Questions et options ajoutées avec succès');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });