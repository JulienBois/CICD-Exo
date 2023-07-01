require('dotenv').config();
const port = 8081;
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

const { Sequelize, DataTypes, where} = require('sequelize');

// Création de l'instance Sequelize et connexion à la base de données
const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'postgres', // Remplacez par le dialecte de votre base de données
});

// Définition du modèle User
const User = sequelize.define('USER', {
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchronisation du modèle avec la base de données (création de la table si elle n'existe pas)
sequelize.sync()
    .then(() => {
        console.log('La synchronisation de la base de données a été effectuée avec succès.');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la synchronisation de la base de données:', error);
    });

// Création de l'application Express
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('src/pages'));
app.listen(port,() => {
    console.log(`Le serveur est lancé sur le port ${port}`);
});
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/login');
});

// Route pour créer un utilisateur
app.post('/signup', (req, res) => {
    let { nom, prenom, email, password } = req.body;
    console.log(req.body);
    password = bcrypt.hashSync(password, salt);
    User.findOne(email, {where: {email: email}}).then( res.json("Mail déjà associé à un compte"));
    User.create({ nom, prenom, email, password })
        .then((user) => {
            res.redirect('/login');
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
});

// Route pour récupérer tous les utilisateurs
app.get('/users', (req, res) => {
    User.findAll()
        .then((users) => {
            res.json(users);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
});

app.post('/login', (req, res) => {
    let {email, password} = req.body;
    password = bcrypt.hashSync(password, salt);
    User.findAll({where: {email : email}})
        .then((user) => {
            for (let i= 0; i < user.length; i++) {
                console.log("wesh mais non");
                bcrypt.compare(password, user[i].get("password"))
                    .then(()=> {
                        res.json("")})
                    .catch(()=> {
                        res.json("Identifiants incorrects");
                    });
                    }
                })
        .catch((error) =>{
            res.status(400).json( {error: error.message})
        })
})

// Route pour récupérer un utilisateur par son ID
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    User.findByPk(id)
        .then((user) => {
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'Utilisateur non trouvé.' });
            }
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
});

// Route pour mettre à jour un utilisateur
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    User.update({ name, email, password }, { where: { id } })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 1) {
                res.json({ message: 'Utilisateur mis à jour avec succès.' });
            } else {
                res.status(404).json({ error: 'Utilisateur non trouvé.' });
            }
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
});

// Route pour supprimer un utilisateur
app.delete('/users/:id', (req, res) => {});
