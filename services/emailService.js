require('dotenv').config();
const nodemailer = require('nodemailer');

const APP_NAME = 'Atlas de Uro-dermatologia';
const MAIL_FROM = process.env.MAIL_FROM || process.env.MAIL_USER;

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
        });
    }

    /**
     * Envia email de verificação de conta
     */
    async sendVerificationEmail(email, firstName, verificationToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3300';
        const verificationPageUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: `"${APP_NAME}" <${MAIL_FROM}>`,
            to: email,
            subject: `Confirme sua conta - ${APP_NAME}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                        .content { padding: 30px 20px; background: #f9fafb; }
                        .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${APP_NAME}</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, ${firstName}!</h2>
                            <p>Obrigado por se cadastrar no ${APP_NAME}. Para ativar sua conta, clique no botão abaixo:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationPageUrl}" style="display: inline-block; padding: 12px 30px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verificar Email</a>
                            </div>
                            
                            <p>Ou copie e cole este link no seu navegador:</p>
                            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">
                                ${verificationPageUrl}
                            </p>
                            
                            <p><strong>Este link expira em 24 horas.</strong></p>
                            
                            <p>Se você não criou esta conta, ignore este email.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logDeliveryResult('Email de verificação', info);
            if (info.rejected && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
                throw new Error(`SMTP rejeitou o email: ${info.rejected.join(', ')}`);
            }
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erro ao enviar email de verificação:', error);
            throw new Error('Falha ao enviar email de verificação');
        }
    }

    /**
     * Envia email de recuperação de senha
     */
    async sendPasswordResetEmail(email, firstName, resetToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetPageUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"${APP_NAME}" <${MAIL_FROM}>`,
            to: email,
            subject: `Redefinir sua senha - ${APP_NAME}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                        .content { padding: 30px 20px; background: #f9fafb; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔒 Redefinir Senha</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, ${firstName}!</h2>
                            <p>Recebemos uma solicitação para redefinir a senha da sua conta no ${APP_NAME}.</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetPageUrl}" style="display: inline-block; padding: 12px 30px; background: #dc2626; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0;">Redefinir Senha</a>
                            </div>
                            
                            <p>Ou copie e cole este link no seu navegador:</p>
                            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">
                                ${resetPageUrl}
                            </p>
                            
                            <p><strong>Este link expira em 1 hora.</strong></p>
                            
                            <p>Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logDeliveryResult('Email de recuperação', info);
            if (info.rejected && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
                throw new Error(`SMTP rejeitou o email: ${info.rejected.join(', ')}`);
            }
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erro ao enviar email de recuperação:', error);
            throw new Error('Falha ao enviar email de recuperação');
        }
    }

    /**
     * Envia email para administradores sobre nova publicação
     */
    async sendNewPublicationNotification(publication, author) {
        const Adm = require('../models/Adm');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const publicationUrl = `${frontendUrl}/publication/${publication.id}`;

        try {
            // Buscar todos os administradores ativos
            const admins = await Adm.findAll({ where: { status: 'ativo' } });
            
            if (admins.length === 0) {
                console.log('Nenhum administrador ativo encontrado');
                return { success: false, message: 'Nenhum administrador ativo' };
            }

            const mailOptions = {
                from: `"${APP_NAME}" <${MAIL_FROM}>`,
                subject: `Nova Publicação Aguardando Análise - ${APP_NAME}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
                            .content { padding: 30px 20px; background: #f9fafb; }
                            .publication-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>📋 Nova Publicação</h1>
                            </div>
                            <div class="content">
                                <h2>Nova publicação aguardando análise</h2>
                                <p>Uma nova publicação foi submetida e está aguardando aprovação.</p>
                                
                                <div class="publication-info">
                                    <h3><strong>Título:</strong> ${publication.title}</h3>
                                    <p><strong>Autor:</strong> ${author.firstName} ${author.lastName}</p>
                                    <p><strong>Email do Autor:</strong> ${author.email}</p>
                                    <p><strong>CRM:</strong> ${author.crm}/${author.uf}</p>
                                    <p><strong>Especialidade:</strong> ${author.especialidade}</p>
                                    <p><strong>Data de Submissão:</strong> ${new Date(publication.createdAt).toLocaleString('pt-BR')}</p>
                                </div>
                                
                                <div style="text-align: center;">
                                    <a href="${publicationUrl}" style="display: inline-block; padding: 12px 30px; background: #f59e0b; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0;">Analisar Publicação</a>
                                </div>
                                
                                <p>Acesse o painel administrativo para revisar e aprovar esta publicação.</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            // Enviar email para todos os administradores
            const emailPromises = admins.map(admin => {
                return this.transporter.sendMail({
                    ...mailOptions,
                    to: admin.email
                });
            });

            const results = await Promise.all(emailPromises);
            results.forEach((info) => this.logDeliveryResult('Email de nova publicação', info));
            console.log(`Email de nova publicação enviado para ${admins.length} administradores`);
            return { success: true, adminCount: admins.length };
        } catch (error) {
            console.error('Erro ao enviar email para administradores:', error);
            throw new Error('Falha ao notificar administradores');
        }
    }

    /**
     * Envia email de boas-vindas após verificação
     */
    async sendWelcomeEmail(email, firstName) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3300';

        const mailOptions = {
            from: `"${APP_NAME}" <${MAIL_FROM}>`,
            to: email,
            subject: `Bem-vindo ao ${APP_NAME}!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                        .content { padding: 30px 20px; background: #f9fafb; }
                        .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Conta Ativada!</h1>
                        </div>
                        <div class="content">
                            <h2>Parabéns, ${firstName}!</h2>
                            <p>Sua conta foi verificada com sucesso. Agora você pode acessar todos os recursos do ${APP_NAME}.</p>
                            
                            <div style="text-align: center;">
                                <a href="${frontendUrl}/auth/login" style="display: inline-block; padding: 12px 30px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0;">Fazer Login</a>
                            </div>
                            
                            <p>Explore nosso conteúdo médico especializado e mantenha-se atualizado com as últimas publicações.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logDeliveryResult('Email de boas-vindas', info);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erro ao enviar email de boas-vindas:', error);
            return { success: false, error: error.message };
        }
    }

    logDeliveryResult(label, info) {
        console.log(`${label} enviado:`, {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            pending: info.pending,
            response: info.response
        });
    }
}

module.exports = new EmailService();