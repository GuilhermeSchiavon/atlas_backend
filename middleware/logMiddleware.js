const { ActionLog } = require('../models');

const logAction = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let entityId = req.params.id || (req.body && req.body.id) || null;
        // Se não veio entityId, tenta extrair do corpo da resposta (ex: publicação recém-criada)
        if (!entityId) {
          try {
            const responseBody = typeof data === 'string' ? JSON.parse(data) : data;
            if (responseBody && responseBody.publication && responseBody.publication.id) {
              entityId = responseBody.publication.id;
            } else if (responseBody && responseBody.id) {
              entityId = responseBody.id;
            }
          } catch (e) {
            // Não conseguiu parsear, ignora
          }
        }
        if (entityId) {
          ActionLog.create({
            action,
            entity_type: entityType,
            entity_id: entityId,
            user_id: req.userId,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.body
            },
            ip_address: req.ip || req.connection.remoteAddress
          }).catch(err => console.error('Log error:', err));
        } else {
          console.error('Log error: entity_id is null');
        }
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { logAction };