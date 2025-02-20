// src/controllers/userController.js


const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.loginUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user.id;
            if (!user.preferencesSet) {
                return res.redirect("/preferences");
            }
            return res.redirect("/map");
        } else {
            throw { password: "Mot de passe incorrect" };
        }
    } catch (error) {
        console.log(error);
        res.render("pages/login.twig", { error });
    }
};

exports.loginPage = async (req, res) => {
    try {
        const mapData = await getMapData(); // Fonction hypothétique pour obtenir les données de la carte
        res.render("pages/login.twig", { mapData });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors du chargement de la page de connexion");
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect("/login");
};

exports.registerUser = async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            const existingUser = await prisma.user.findUnique({
                where: { email: req.body.email }
            });

            if (existingUser) {
                throw { email: "Cet email est déjà utilisé." };
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const dateOfBirth = new Date(req.body.dateOfBirth);
            if (isNaN(dateOfBirth.getTime())) {
                throw { dateOfBirth: "Date de naissance invalide" };
            }

            const user = await prisma.user.create({
                data: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    dateOfBirth: dateOfBirth,
                    gender: req.body.gender,
                    password: hashedPassword
                }
            });

            req.session.userId = user.id;
            res.redirect("/preferences");
        } else {
            throw { confirmPassword: "Les mots de passe ne correspondent pas." };
        }
    } catch (error) {
        console.log(error);
        res.render("pages/register.twig", { error, title: "Inscription" });
    }
};