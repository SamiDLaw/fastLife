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
                        { text: 'Cuisine Française', imagePath: '/assets/img/options/cuisine_fran_aise.jpg' },
                        { text: 'Cuisine Italienne', imagePath: '/assets/img/options/cuisine_italienne.jpg' },
                        { text: 'Cuisine Japonaise', imagePath: '/assets/img/options/cuisine_japonaise.jpg' },
                        { text: 'Cuisine Méditerranéenne', imagePath: '/assets/img/options/cuisine_m_diterran_enne.jpg' },
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
                        { text: 'Sport & Fitness', imagePath: '/assets/img/options/sport_fitness.jpg' },
                        { text: 'Art & Culture', imagePath: '/assets/img/options/art_culture.jpg' },
                        { text: 'Nature & Plein air', imagePath: '/assets/img/options/nature_plein_air.jpg' },
                        { text: 'Musique & Concerts', imagePath: '/assets/img/options/musique_concerts.jpg' },
                        { text: 'Bien-être & Détente', imagePath: '/assets/img/options/bien_etre_d_tente.jpg' }
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
                        { text: 'Décontractée', imagePath: '/assets/img/options/d_contract_e.jpg' },
                        { text: 'Élégante', imagePath: '/assets/img/options/_l_gante.jpg' },
                        { text: 'Festive', imagePath: '/assets/img/options/festive.jpg' },
                        { text: 'Romantique', imagePath: '/assets/img/options/romantique.jpg' },
                        { text: 'Branchée', imagePath: '/assets/img/options/branch_e.jpg' }
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
                        { text: 'Économique', imagePath: '/assets/img/options/_conomique.jpg' },
                        { text: 'Moyen', imagePath: '/assets/img/options/moyen.jpg' },
                        { text: 'Premium', imagePath: '/assets/img/options/premium.jpg' },
                        { text: 'Luxe', imagePath: '/assets/img/options/luxe.jpg' }
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
                    { text: "Musées et expositions", imagePath: '/assets/img/options/mus_es_et_expositions.jpg' },
                    { text: "Théâtre et spectacles", imagePath: '/assets/img/options/th_tre_et_spectacles.jpg' },
                    { text: "Concerts et festivals", imagePath: '/assets/img/options/concerts_et_festivals.jpg' },
                    { text: "Sites historiques", imagePath: '/assets/img/options/sites_historiques.jpg' }
                ]
            },
            {
                text: "Quelles activités sportives préférez-vous ?",
                categoryId: sportsCat.id,
                options: [
                    { text: "Sports nautiques", imagePath: '/assets/img/options/sports_nautiques.jpg' },
                    { text: "Randonnée", imagePath: '/assets/img/options/randonn_e.jpg' },
                    { text: "Vélo", imagePath: '/assets/img/options/v_lo.jpg' },
                    { text: "Escalade", imagePath: '/assets/img/options/escalade.jpg' }
                ]
            },
            {
                text: "Quelles expériences culinaires recherchez-vous ?",
                categoryId: gastronomyCat.id,
                options: [
                    { text: "Restaurants gastronomiques", imagePath: '/assets/img/options/restaurants_gastronomiques.jpg' },
                    { text: "Cuisine locale traditionnelle", imagePath: '/assets/img/options/cuisine_locale_traditionnelle.jpg' },
                    { text: "Street food", imagePath: '/assets/img/options/street_food.jpg' },
                    { text: "Bars et cafés", imagePath: '/assets/img/options/bars_et_caf_s.jpg' }
                ]
            },
            {
                text: "Quel type d'environnement préférez-vous ?",
                categoryId: natureCat.id,
                options: [
                    { text: "Plages", imagePath: '/assets/img/options/plages.jpg' },
                    { text: "Parcs et jardins", imagePath: '/assets/img/options/parcs_et_jardins.jpg' },
                    { text: "Montagnes", imagePath: '/assets/img/options/montagnes.jpg' },
                    { text: "Forêts", imagePath: '/assets/img/options/for_ts.jpg' }
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

// Exporter la fonction main pour pouvoir l'appeler depuis d'autres fichiers
module.exports = { main };

// Exécuter le script si appelé directement
if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
