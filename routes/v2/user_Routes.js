require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const { Sequelize } = require('sequelize');
const User = require("../../models/User")
const { protect, protectADM } = require('../../middleware/authMiddleware');
const { generateTokenWithExpiration } = require('../../utils/tokenGenerator');
const emailService = require('../../services/emailService');
        
    router.post('/register', async (req, res) => {
        const { firstName, lastName, email, password, cpf, crm, uf, especialidade } = req.body;
        try {
            // Validações
            if (!cpf || cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
                return res.status(400).json({ message: 'CPF deve conter exatamente 11 dígitos numéricos' });
            }
            
            if (!crm || !uf) {
                return res.status(400).json({ message: 'CRM e UF são obrigatórios' });
            }
            
            if (uf.length !== 2) {
                return res.status(400).json({ message: 'UF deve conter exatamente 2 caracteres' });
            }
            
            if (!['Urologista', 'Dermatologista'].includes(especialidade)) {
                return res.status(400).json({ message: 'Especialidade deve ser Urologista ou Dermatologista' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email já cadastrado' });
            }
            
            const existingCpf = await User.findOne({ where: { cpf } });
            if (existingCpf) {
                return res.status(400).json({ message: 'CPF já cadastrado' });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Gerar token de verificação
            const { token: verificationToken, expiresAt } = generateTokenWithExpiration(24);

            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                cpf,
                crm,
                uf: uf.toUpperCase(),
                especialidade,
                status: 'pendente',
                verificationToken,
                verificationTokenExpires: expiresAt,
                emailVerified: false
            });

            // Enviar email de verificação
            try {
                await emailService.sendVerificationEmail(email, firstName, verificationToken);
                console.log(`Email de verificação enviado para: ${email}`);
            } catch (emailError) {
                console.error('Erro ao enviar email de verificação:', emailError);
                // Não falha o registro se o email não for enviado
            }

            delete user.dataValues.password;
            delete user.dataValues.verificationToken;
            
            return res.status(201).json({ 
                message: 'Conta criada com sucesso! Verifique seu email para ativar a conta.',
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    status: user.status,
                    emailVerified: user.emailVerified
                }
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });

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

            // Verificar se o email foi confirmado
            if (!user.emailVerified) {
                return res.status(403).json({
                    message: "Email não verificado. Verifique sua caixa de entrada e clique no link de confirmação.",
                    emailVerified: false,
                    email: user.email
                });
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

    router.get('/', protectADM, async (req, res) => {
        try {
        const keyword = req.query.keyword || "";
        const pageNumber = Number(req.query.pageNumber) || 1;
        const pageSize = Number(req.query.pageSize) || 12;
        const status = req.query.status || null;
        const offset = (pageNumber - 1) * pageSize;
    
        let whereClause = {
            [Sequelize.Op.or]: [
            { firstName: { [Sequelize.Op.like]: `%${keyword}%` } },
            { lastName: { [Sequelize.Op.like]: `%${keyword}%` } },
            { email: { [Sequelize.Op.like]: `%${keyword}%` } }
            ]
        };
        if (status) whereClause.status = status;
    
        let includeClause = [
            // { model: Category, attributes: ['id', 'title', 'description', 'slug'] },
            // { model: User, as: 'Author', attributes: ['firstName', 'lastName'] },
            // { model: Image, attributes: ['id', 'filename', 'path_local', 'description', 'order'] }
        ];

        const { count, rows: itens } = await User.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });
    
        res.status(200).json({
            itens,
            pageNumber,
            pages: Math.ceil(count / pageSize),
            total: count
        });
        } catch (error) {
        return res.status(500).json({ 
            message: "Falha ao carregar os usuários!", 
            error: error.message 
        });
        }
    });
    
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

    // Verificação de email
    router.get('/verify-email', async (req, res) => {
        const { token } = req.query;
        
        try {
            if (!token) {
                return res.status(400).json({ message: 'Token de verificação é obrigatório' });
            }

            const user = await User.findOne({ 
                where: { 
                    verificationToken: token,
                    emailVerified: false
                } 
            });

            if (!user) {
                return res.status(400).json({ message: 'Token inválido ou já utilizado' });
            }

            // Verificar se o token expirou
            if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
                return res.status(400).json({ message: 'Token expirado' });
            }

            // Ativar a conta
            await user.update({
                emailVerified: true,
                emailVerifiedAt: new Date(),
                status: 'ativo',
                verificationToken: null,
                verificationTokenExpires: null
            });

            // Enviar email de boas-vindas
            try {
                await emailService.sendWelcomeEmail(user.email, user.firstName);
            } catch (emailError) {
                console.error('Erro ao enviar email de boas-vindas:', emailError);
            }

            return res.status(200).json({ 
                message: 'Email verificado com sucesso! Sua conta foi ativada.',
                verified: true
            });
        } catch (error) {
            console.error('Erro na verificação de email:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Reenviar email de verificação
    router.post('/resend-verification', async (req, res) => {
        const { email } = req.body;
        
        try {
            if (!email) {
                return res.status(400).json({ message: 'Email é obrigatório' });
            }

            const user = await User.findOne({ 
                where: { 
                    email,
                    emailVerified: false
                } 
            });

            if (!user) {
                return res.status(400).json({ message: 'Usuário não encontrado ou email já verificado' });
            }

            // Gerar novo token
            const { token: verificationToken, expiresAt } = generateTokenWithExpiration(24);
            
            await user.update({
                verificationToken,
                verificationTokenExpires: expiresAt
            });

            // Enviar novo email
            await emailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

            return res.status(200).json({ 
                message: 'Email de verificação reenviado com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao reenviar email:', error);
            return res.status(500).json({ message: 'Erro ao reenviar email de verificação' });
        }
    });

    // Solicitar reset de senha
    router.post('/forgot-password', async (req, res) => {
        const { email } = req.body;
        
        try {
            if (!email) {
                return res.status(400).json({ message: 'Email é obrigatório' });
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(200).json({ 
                    message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
                });
            }

            // Gerar token de reset (expira em 1 hora)
            const { token: resetToken, expiresAt } = generateTokenWithExpiration(1);
            
            await user.update({
                resetPasswordToken: resetToken,
                resetPasswordExpires: expiresAt
            });

            // Enviar email
            await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

            return res.status(200).json({ 
                message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
            });
        } catch (error) {
            console.error('Erro ao solicitar reset de senha:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Redefinir senha
    router.post('/reset-password', async (req, res) => {
        const { token, newPassword } = req.body;
        
        try {
            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
            }

            const user = await User.findOne({ 
                where: { 
                    resetPasswordToken: token
                } 
            });

            if (!user) {
                return res.status(400).json({ message: 'Token inválido' });
            }

            // Verificar se o token expirou
            if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
                return res.status(400).json({ message: 'Token expirado' });
            }

            // Hash da nova senha
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Atualizar senha e limpar tokens
            await user.update({
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            });

            return res.status(200).json({ 
                message: 'Senha redefinida com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
   
    
 module.exports = router