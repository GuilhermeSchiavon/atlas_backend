const { ActionLog } = require('../models');

const logAction = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || (req.body && req.body.id) || null;
        
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
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { logAction };