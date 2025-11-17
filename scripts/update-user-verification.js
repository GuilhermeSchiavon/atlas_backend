require('dotenv').config();
const User = require('../models/User');
const sequelize = require('../config/db');

async function updateUserVerificationFields() {
    try {
        console.log('Conectando ao banco de dados...');
        await sequelize.authenticate();
        console.log('Conexão estabelecida com sucesso.');

        console.log('Sincronizando modelo User com novos campos...');
        await User.sync({ alter: true });
        console.log('Modelo User sincronizado com sucesso.');

        // Atualizar usuários existentes para ter emailVerified = true se status = 'ativo'
        console.log('Atualizando usuários existentes...');
        const [updatedCount] = await User.update(
            { 
                emailVerified: true,
                emailVerifiedAt: new Date()
            },
            { 
                where: { 
                    status: 'ativo',
                    emailVerified: false
                } 
            }
        );

        console.log(`${updatedCount} usuários ativos foram marcados como email verificado.`);

        console.log('Atualização concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro durante a atualização:', error);
        process.exit(1);
    }
}

updateUserVerificationFields();