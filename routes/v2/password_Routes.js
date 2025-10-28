require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require("../../models/User")

      
router.post('/verify-user', async (req, res) => {
    const email = req.body.userInput;
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const payload = { email: user.email, type: 'password-reset' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        await user.update({ token });

        delete user.dataValues.password;
        delete user._previousDataValues.password;

        return res.status(200).json({ message: 'Token Gerado'});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
});

router.post('/verify-token', async (req, res) => {
    const { token } = req.body;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: payload.email } });
    
        if (user || user.token == token) {
            return res.status(200).json({ valido : true });
        }
        return res.status(400).json({ message: 'Token inválido ou expirado' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(500).json({ message: 'Token expirado' });
        } else {
            res.status(500).json({message: error.message})
        }
    }
});

router.post('/', async (req, res) => {
    const { password, token } = req.body;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: payload.email } });

        if (!user || user.token !== token) {
            return res.status(400).json({ message: 'Token inválido' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
     
        await user.update({ password: hashedPassword, status: 'ativo', token: 'Password Redefined' });

        let tokenLogin
        if(user.accounType == 'adm'){
            tokenLogin = await jwt.sign({ id: user.id }, process.env.JWT_SECRET_ADM, { expiresIn: Number(process.env.SESSION_TIME) });
        }else {
            tokenLogin = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: Number(process.env.SESSION_TIME) });
        }
        
        delete user.password;
        delete user.dataValues.token;
        delete user.dataValues.password;
        delete user._previousDataValues.password;
        
        return res.status(200).json({
            message: 'Senha alterada com sucesso', 
            user,
            token: tokenLogin
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Token inválido' });
    }
});
 module.exports = router