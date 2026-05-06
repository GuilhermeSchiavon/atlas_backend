require('dotenv').config();
const sequelize = require('../config/db');
const { MEDICAL_SPECIALTIES } = require('../constants/specialties');

async function updateSpecialtiesEnum() {
    try {
        const enumValues = MEDICAL_SPECIALTIES.map((specialty) => `'${specialty.replace(/'/g, "''")}'`).join(', ');

        await sequelize.query(`ALTER TABLE Users MODIFY especialidade ENUM(${enumValues}) NOT NULL`);

        console.log('Especialidades atualizadas com sucesso.');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao atualizar especialidades:', error);
        process.exit(1);
    }
}

updateSpecialtiesEnum();
