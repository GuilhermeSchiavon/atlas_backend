const { Sequelize } = require('sequelize');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Adm } = require("../../models/index")
const { protectADM } = require('../../middleware/authMiddleware')

    router.post('/login', (req, res, next) => {
        if (!req.headers['x-requested-with']) {
            return res.status(403).json({ message: 'CSRF protection' });
        }
        next();
    }, async (req, res) => {
        // Now protected against CSRF attacks
        const { email, password }  = req.body;
        try {
            const existingUser = await Adm.findOne({ where: { email } });

            if (!existingUser) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

                //Gerando o hash da senha usando bcrypt
                // const saltRounds = 10;
                // const hashedPassword = await bcrypt.hash(password, saltRounds);
                // console.log({email, hashedPassword});

            const isValidPassword = await bcrypt.compare(password, existingUser.password);

            if (!isValidPassword) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

            delete existingUser.password;
            delete existingUser.dataValues.password;
            delete existingUser._previousDataValues.password;


            const token = await jwt.sign({ user: existingUser }, process.env.JWT_SECRET_ADM, {
                expiresIn: Number(process.env.SESSION_TIME)
            });

            return res.status(200).json({ user: existingUser, token });
        
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    })

 module.exports = router