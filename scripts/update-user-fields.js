const sequelize = require('../config/db');
const User = require('../models/User');

async function updateUserFields() {
  try {
    console.log('Atualizando campos da tabela User...');
    
    // Sincroniza o modelo com o banco de dados, adicionando novos campos
    await User.sync({ alter: true });
    
    console.log('Campos atualizados com sucesso!');
    console.log('Novos campos adicionados:');
    console.log('- cpf (STRING(11), validação numérica)');
    console.log('- crm (STRING(20), obrigatório)');
    console.log('- uf (STRING(2), obrigatório, maiúsculo)');
    console.log('- especialidade (ENUM: Urologista, Dermatologista, obrigatório)');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar campos:', error);
    process.exit(1);
  }
}

updateUserFields();