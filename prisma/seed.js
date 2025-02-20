const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Nettoyer la base de données
        await prisma.preference.deleteMany();
        await prisma.option.deleteMany();
        await prisma.question.deleteMany();
        await prisma.category.deleteMany();
        await prisma.location.deleteMany();

        // Créer les catégories
        const categories = await Promise.all([
            prisma.category.create({
                data: { name: 'Cuisine' }
            }),
            prisma.category.create({
                data: { name: 'Activités' }
            }),
            prisma.category.create({
                data: { name: 'Ambiance' }
            }),
            prisma.category.create({
                data: { name: 'Budget' }
            }),
            prisma.category.create({
                data: { name: 'Activités culturelles' }
            }),
            prisma.category.create({
                data: { name: 'Sports et loisirs' }
            }),
            prisma.category.create({
                data: { name: 'Gastronomie' }
            }),
            prisma.category.create({
                data: { name: 'Nature et plein air' }
            })
        ]);

        // Créer les questions et options pour chaque catégorie
        const [cuisineCat, activitiesCat, ambianceCat, budgetCat, cultureCat, sportsCat, gastronomyCat, natureCat] = categories;

        // Questions et options pour la cuisine
        await prisma.question.create({
            data: {
                text: 'Quels types de cuisine préférez-vous ?',
                categoryId: cuisineCat.id,
                options: {
                    create: [
                        { text: 'Cuisine Française', imagePath: '/assets/img/options/french_cuisine.jpg' },
                        { text: 'Cuisine Italienne', imagePath: '/assets/img/options/italian_cuisine.jpg' },
                        { text: 'Cuisine Japonaise', imagePath: '/assets/img/options/japanese_cuisine.jpg' },
                        { text: 'Cuisine Méditerranéenne', imagePath: '/assets/img/options/mediterranean_cuisine.jpg' },
                        { text: 'Street Food', imagePath: '/assets/img/options/street_food.jpg' }
                    ]
                }
            }
        });

        // Questions et options pour les activités
        await prisma.question.create({
            data: {
                text: 'Quelles activités vous intéressent ?',
                categoryId: activitiesCat.id,
                options: {
                    create: [
                        { text: 'Sport & Fitness', imagePath: '/assets/img/options/sports.jpg' },
                        { text: 'Art & Culture', imagePath: '/assets/img/options/art_culture.jpg' },
                        { text: 'Nature & Plein air', imagePath: '/assets/img/options/nature.jpg' },
                        { text: 'Musique & Concerts', imagePath: '/assets/img/options/music.jpg' },
                        { text: 'Bien-être & Détente', imagePath: '/assets/img/options/wellness.jpg' }
                    ]
                }
            }
        });

        // Questions et options pour l'ambiance
        await prisma.question.create({
            data: {
                text: 'Quelle ambiance recherchez-vous ?',
                categoryId: ambianceCat.id,
                options: {
                    create: [
                        { text: 'Décontractée', imagePath: '/assets/img/options/casual.jpg' },
                        { text: 'Élégante', imagePath: '/assets/img/options/elegant.jpg' },
                        { text: 'Festive', imagePath: '/assets/img/options/festive.jpg' },
                        { text: 'Romantique', imagePath: '/assets/img/options/romantic.jpg' },
                        { text: 'Branchée', imagePath: '/assets/img/options/trendy.jpg' }
                    ]
                }
            }
        });

        // Questions et options pour le budget
        await prisma.question.create({
            data: {
                text: 'Quel est votre budget préféré ?',
                categoryId: budgetCat.id,
                options: {
                    create: [
                        { text: 'Économique', imagePath: '/assets/img/options/budget.jpg' },
                        { text: 'Moyen', imagePath: '/assets/img/options/moderate.jpg' },
                        { text: 'Premium', imagePath: '/assets/img/options/premium.jpg' },
                        { text: 'Luxe', imagePath: '/assets/img/options/luxury.jpg' }
                    ]
                }
            }
        });

        // Questions et options pour les préférences
        const questions = [
            {
                text: "Quel type d'activités culturelles vous intéresse ?",
                categoryId: cultureCat.id,
                options: [
                    { text: "Musées et expositions" },
                    { text: "Théâtre et spectacles" },
                    { text: "Concerts et festivals" },
                    { text: "Sites historiques" }
                ]
            },
            {
                text: "Quelles activités sportives préférez-vous ?",
                categoryId: sportsCat.id,
                options: [
                    { text: "Sports nautiques" },
                    { text: "Randonnée" },
                    { text: "Vélo" },
                    { text: "Escalade" }
                ]
            },
            {
                text: "Quelles expériences culinaires recherchez-vous ?",
                categoryId: gastronomyCat.id,
                options: [
                    { text: "Restaurants gastronomiques" },
                    { text: "Cuisine locale traditionnelle" },
                    { text: "Street food" },
                    { text: "Bars et cafés" }
                ]
            },
            {
                text: "Quel type d'environnement préférez-vous ?",
                categoryId: natureCat.id,
                options: [
                    { text: "Plages" },
                    { text: "Parcs et jardins" },
                    { text: "Montagnes" },
                    { text: "Forêts" }
                ]
            }
        ];

        for (const question of questions) {
            await prisma.question.create({
                data: {
                    text: question.text,
                    categoryId: question.categoryId,
                    options: {
                        create: question.options
                    }
                }
            });
        }

        // Créer quelques lieux de test
        const locations = [
            {
                name: "Vieux-Port de Marseille",
                description: "Le cœur historique et animé de Marseille",
                latitude: 43.2951,
                longitude: 5.3740
            },
            {
                name: "Notre-Dame de la Garde",
                description: "La Bonne Mère qui veille sur Marseille",
                latitude: 43.2841,
                longitude: 5.3711
            },
            {
                name: "Parc national des Calanques",
                description: "Magnifiques criques et falaises calcaires",
                latitude: 43.2181,
                longitude: 5.4301
            },
            {
                name: "Le Panier",
                description: "Le plus vieux quartier de Marseille",
                latitude: 43.2988,
                longitude: 5.3694
            },
            {
                name: "MuCEM",
                description: "Musée des Civilisations de l'Europe et de la Méditerranée",
                latitude: 43.2965,
                longitude: 5.3612
            }
        ];

        for (const location of locations) {
            await prisma.location.create({
                data: location
            });
        }

        console.log('Base de données initialisée avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
