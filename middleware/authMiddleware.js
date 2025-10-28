require('dotenv').config();
const jwt = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler');

const protect = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if(authHeader == undefined || authHeader == 'Bearer null') return res.status(401).json({ message: 'Sessão expirada'})

    if (!authHeader) return res.status(401).json({ message: 'Sessão expirada'})

    const parts = authHeader.split(' ');

    if (parts.length !== 2) return res.status(401).json({ message: 'Sessão expirada'})

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: 'Sessão expirada'})

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Sessão expirada'}) 
        
        req.userId = decoded.id;
        next();
    });
}

const verify = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if(authHeader == undefined || authHeader == 'Bearer null') { next(); return false; }

    if (!authHeader) { next(); return false; }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) { next(); return false; }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) { next(); return false; }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { next(); return false; }
        
        req.userId = decoded.id;
        next();
    });

}

const protectADM = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Token não fornecido'})

    const parts = authHeader.split(' ');
  
    if (parts.length !== 2) return res.status(401).json({ message: 'Token mal formatado'})

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: 'Token mal formatado'})

    jwt.verify(token, process.env.JWT_SECRET_ADM, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Sessão expirada'}) 
        
        req.userId = decoded.id;
        next();
    });
}

module.exports = { protect, protectADM, verify }