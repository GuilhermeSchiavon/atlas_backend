const crypto = require('crypto');

/**
 * Gera um token seguro para verificação de email
 * @returns {string} Token hexadecimal de 32 bytes
 */
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Gera um token com expiração
 * @param {number} expirationHours - Horas até expirar (padrão: 24h)
 * @returns {object} Objeto com token e data de expiração
 */
function generateTokenWithExpiration(expirationHours = 24) {
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    
    return {
        token,
        expiresAt
    };
}

module.exports = {
    generateVerificationToken,
    generateTokenWithExpiration
};