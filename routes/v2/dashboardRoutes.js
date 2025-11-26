const router = require('express').Router();
const { QueryTypes } = require('sequelize');
const { Publication, Category, User } = require("../../models");
const { protectADM } = require('../../middleware/authMiddleware');

// Estatísticas gerais do dashboard
router.get('/stats', protectADM, async (req, res) => {
  try {
    const sequelize = Publication.sequelize;
    
    const stats = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM Publications) as totalPublications,
        (SELECT COUNT(*) FROM Publications WHERE status = 'pending') as pendingPublications,
        (SELECT COUNT(*) FROM Publications WHERE status = 'approved') as approvedPublications,
        (SELECT COUNT(*) FROM Publications WHERE status = 'rejected') as rejectedPublications,
        (SELECT COUNT(*) FROM Users) as totalUsers,
        (SELECT COUNT(*) FROM Users WHERE status = 'ativo') as activeUsers,
        (SELECT COUNT(*) FROM Users WHERE status = 'pendente') as pendingUsers,
        (SELECT COUNT(*) FROM Categories) as totalCategories,
        (SELECT COUNT(*) FROM Categories WHERE status = 'ativo') as activeCategories
    `, { type: QueryTypes.SELECT });

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar estatísticas", error: error.message });
  }
});

// Atividade recente
router.get('/activity', protectADM, async (req, res) => {
  try {
    const sequelize = Publication.sequelize;
    
    const activity = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM Publications WHERE DATE(createdAt) = CURDATE()) as today,
        (SELECT COUNT(*) FROM Publications WHERE YEARWEEK(createdAt) = YEARWEEK(NOW())) as thisWeek,
        (SELECT COUNT(*) FROM Publications WHERE MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())) as thisMonth
    `, { type: QueryTypes.SELECT });

    res.json(activity[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar atividade", error: error.message });
  }
});

// Publicações por categoria
router.get('/publications-by-category', protectADM, async (req, res) => {
  try {
    const sequelize = Publication.sequelize;
    
    const data = await sequelize.query(`
      SELECT 
        c.title as category,
        COUNT(DISTINCT p.id) as total
      FROM Categories c
      LEFT JOIN PublicationCategories pc ON c.id = pc.category_id
      LEFT JOIN Publications p ON pc.publication_id = p.id
      WHERE c.status = 'ativo'
      GROUP BY c.id, c.title
      HAVING total > 0
      ORDER BY total DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar publicações por categoria", error: error.message });
  }
});

// Publicações por estado
router.get('/publications-by-state', protectADM, async (req, res) => {
  try {
    const sequelize = Publication.sequelize;
    
    const data = await sequelize.query(`
      SELECT 
        u.uf,
        COUNT(DISTINCT p.id) as total
      FROM Users u
      INNER JOIN Publications p ON u.id = p.user_id
      WHERE u.uf IS NOT NULL AND u.uf != ''
      GROUP BY u.uf
      ORDER BY total DESC
    `, { type: QueryTypes.SELECT });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar publicações por estado", error: error.message });
  }
});

module.exports = router;