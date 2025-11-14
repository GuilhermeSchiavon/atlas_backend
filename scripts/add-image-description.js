const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

async function addImageDescriptionField() {
  try {
    console.log('Adicionando campo description à tabela Images...');
    
    await sequelize.getQueryInterface().addColumn('Images', 'description', {
      type: DataTypes.TEXT,
      allowNull: true
    });
    
    console.log('Campo description adicionado com sucesso!');
  } catch (error) {
    if (error.message.includes('column already exists') || error.message.includes('Duplicate column name')) {
      console.log('Campo description já existe na tabela Images.');
    } else {
      console.error('Erro ao adicionar campo description:', error.message);
      throw error;
    }
  }
}

if (require.main === module) {
  addImageDescriptionField()
    .then(() => {
      console.log('Migração concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = addImageDescriptionField;