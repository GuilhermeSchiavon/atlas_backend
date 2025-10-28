require('dotenv').config();
const Sequelize = require('sequelize')
const sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: process.env.DB_CONNECTION,
            timezone: '-03:00',
            pool: {
                max: 10,         // Aumente se necessário
                min: 0,
                acquire: 20000,  // Tempo máximo de espera (20s)
                idle: 10000
            }
        }
    );

sequelize.authenticate(
    console.log ("Banco de Dados Exemplo - Conectado")
)
.catch((error) => (
    console.log ("Banco de Dados Exemplo - Falha ao conectar -> " + error )
))

module.exports = sequelize;