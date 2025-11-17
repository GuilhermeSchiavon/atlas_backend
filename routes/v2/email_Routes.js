require('dotenv').config();
const nodemailer = require("nodemailer");
const router = require('express').Router();
const User = require("../../models/User")

    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_SECURE, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    });

    function emailCensurado(email) {
        if (!email) {
            return '';
        }

        const indiceArroba = email.indexOf('@');

        if (indiceArroba >= 0) {
            const parteAntesArroba = email.slice(0, indiceArroba);
            const parteDepoisArroba = email.slice(indiceArroba);
            const censurado = parteAntesArroba.slice(0, 2) + '*'.repeat(parteAntesArroba.length - 4) + parteAntesArroba.slice(-2);

            return censurado + parteDepoisArroba;
        } else {
            return email;
        }
    };

    router.post('/', async (req, res) => {
        const mailOptions  = req.body;

        console.log(mailOptions)

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error)
                res.status(401).json({ message: false, error, info })
            } else {
                res.status(200).json({ send: true})
            }
        });
    });

    router.post('/resetPassword', async (req, res) => {
        let { userInput, mailOptions, HTML } = req.body;
        try {
            const user = await User.findOne({ where: { email: userInput} });
       
            if (!user) {
                return res.status(401).json({ message: "Usuário inválido" });
            }

            if(!user.token || user.token == undefined || user.token == '' || user.token == 'newPassword'){
                return res.status(400).json({ message: 'Token inválido ou expirado' });
            }
        
            mailOptions.html = HTML.first + user.token + HTML.second
            mailOptions.to = user.email

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                    res.status(401).json({ message: false, error, info })
                } else {
                    res.status(200).json({ 
                        send: true,
                        email: emailCensurado(user.email), 
                        message: 'Enviamos um e-mail para a auteração de sua senha.'
                    })
                }
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });

    router.post('/chatMessage', async (req, res) => {
        let { mailOptions, HTML } = req.body;
        try {
       
            mailOptions.html = HTML.first + HTML.second
            mailOptions.to = "guilherme.schiavon@outlook.com"
            // mailOptions.to = user.email

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                    res.status(401).json({ message: false, error, info })
                } else {
                    res.status(200).json({ 
                        send: true,
                        // email: emailCensurado(user.email), 
                        // email: emailCensurado('guilherme@schiavon.dev'), 
                        message: 'Enviamos sua mensagem.'
                    })
                }
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });

 module.exports = router