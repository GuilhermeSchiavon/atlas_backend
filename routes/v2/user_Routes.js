require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const { Sequelize } = require('sequelize');
 const User = require("../../models/User")
const { protect, protectADM } = require('../../middleware/authMiddleware');
        
    router.post('/login', async (req, res) => {
        const { email, password }  = req.body;
        try {

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }
            // const saltRounds = 10;
            // const hashedPassword = await bcrypt.hash(password, saltRounds);
            // console.log('hashedPassword', hashedPassword)

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

            if(!user || user === undefined || user == '')  {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            } 
            
            const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: Number(process.env.SESSION_TIME) // expires in 1 hora
            });
            delete user.dataValues.password;
            delete user._previousDataValues.password;

            return res.status(200).json({ user, token });
        } catch (error) {
            res.status(500).json({message:error})
        }
    })

    router.post('/login-adm', async (req, res) => {
        const { email, password }  = req.body;
        try {
            const user = await User.findOne({ where: { email, accounType: 'adm' } });
            if (!user) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }
            // const saltRounds = 10;
            // const hashedPassword = await bcrypt.hash(password, saltRounds);
            // console.log('hashedPassword', hashedPassword)

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

            if(!user || user === undefined || user == '')  {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            } 
            
            const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET_ADM, {
                expiresIn: Number(process.env.SESSION_TIME) // expires in 1 hora
            });
            delete user.dataValues.password;
            delete user._previousDataValues.password;

            return res.status(200).json({ user, token });
        } catch (error) {
            res.status(500).json({message:error})
        }
    })

    router.post('/authenticated', protect, async (req, res) => {
        try {
            if (!req.userId) return res.status(401).json({ message: 'Token não fornecido', stack: null})
            const userID = req.userId
            const user = await User.findOne({ where:  userID  });

            if (!user) {
                return res.status(401).json({message: "Usuário não encontrado.", stack: null})
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: Number(process.env.SESSION_TIME) // expires in 1 hora
            });

            return res.status(200).json({ user, token });

        } catch (error) {
            res.status(500).json({message: error})
        }
    });
    
    router.get('/profile', protect, async (req, res) => {
        try{
            if (!req.userId) return res.status(401).json({ message: 'Token não fornecido', stack: null})
            const userID = req.userId
            const user = await User.findOne({ where:  userID, status: 'ativo'  });

            if(!user || user === undefined || user == '')  {
                res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            } 
            
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: Number(process.env.SESSION_TIME) // expires in 1 hora
            });

            user.token = token;

            delete user.dataValues.password;
            delete user._previousDataValues.password;

            res.json({ user, token });
        } catch (error) {
            res.status(500).json({message: error})
        }
    });
   
    
 module.exports = router