require('dotenv').config();
const User = require('../models/User');
const sequelize = require('../config/db');

async function updatePasswordResetFields() {
    try {
        console.log('Conectando ao banco de dados...');
        await sequelize.authenticate();
        console.log('Conexão estabelecida com sucesso.');

        console.log('Sincronizando modelo User com campos de reset de senha...');
        await User.sync({ alter: true });
        console.log('Modelo User sincronizado com sucesso.');

        console.log('Atualização de campos de reset de senha concluída!');
        process.exit(0);
    } catch (error) {
        console.error('Erro durante a atualização:', error);
        process.exit(1);
    }
}

updatePasswordResetFields();