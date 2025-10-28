require('dotenv').config(); // ✅ necessário para ler DB_HOST, DB_CONNECTION, etc
const sequelize = require('../config/db');
require('../models/index');

(async () => {
  try {
    await sequelize.sync(); // ou { force: true } se quiser forçar a recriação das tabelas
    console.log('✅ Banco sincronizado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao sincronizar o banco:', err);
    process.exit(1);
  }
})();
