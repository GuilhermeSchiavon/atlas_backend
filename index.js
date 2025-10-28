// Configuração Inicial
require('dotenv').config();

const cors = require('cors')
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

// Liberandoa Access para outros Dominios
    const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
    app.use(cors({
        origin: corsOrigins,
    }));

// Configurar o middleware para servir imagens estáticas
    app.use('/uploads',  express.static('uploads'));

// Forma de Ler JSON -> Pelas Midddlewares
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json());

// Rota inicial /endpoint
    app.get('/', (req, res) => {
        res.json({name: process.env.DB_DATABASE, status: 'online'});
    });

// Rotas
    const api_Routes = require("./routes/v2/Routes")
    
    // Liberação da pasta para acesso de arquivos
    app.use('/uploads',  express.static('uploads'));

    // app.use("/api/v1", api_Routes);
    app.use("/api/v2", api_Routes);

    // Middleware de tratamento de erros
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something went wrong!' });
    });

    const hostname = process.env.HOST;
    const port = process.env.PORT || 1000;

    app.listen(port, hostname, () => {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        console.log(`Server running at ${protocol}://${hostname}:${port}/`);
    });