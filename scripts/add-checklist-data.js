const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

async function addChecklistDataField() {
  try {
    console.log('Adicionando campo checklist_data à tabela Publications...');
    
    await sequelize.getQueryInterface().addColumn('Publications', 'checklist_data', {
      type: DataTypes.JSON,
      allowNull: true
    });
    
    console.log('Campo checklist_data adicionado com sucesso!');
  } catch (error) {
    if (error.message.includes('column already exists') || error.message.includes('Duplicate column name')) {
      console.log('Campo checklist_data já existe na tabela Publications.');
    } else {
      console.error('Erro ao adicionar campo checklist_data:', error.message);
      throw error;
    }
  }
}

if (require.main === module) {
  addChecklistDataField()
    .then(() => {
      console.log('Migração concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = addChecklistDataField;