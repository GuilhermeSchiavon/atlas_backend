const { User } = require('../models');

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Token não fornecido' });
      }

      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      if (!roles.includes(user.accounType)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

module.exports = { requireRole };