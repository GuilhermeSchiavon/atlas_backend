const router = require('express').Router();
const { QueryTypes } = require('sequelize');
const { Publication, Category, User } = require("../../models");
const { protectADM } = require('../../middleware/authMiddleware');

// Opções para filtros de categorias
router.get('/categories', protectADM, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 'ativo' },
      attributes: ['id', 'title'],
      order: [['title', 'ASC']]
    });

    const options = categories.map(cat => ({
      value: cat.id,
      label: cat.title
    }));

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar categorias", error: error.message });
  }
});

// Opções para filtros de autores
router.get('/authors', protectADM, async (req, res) => {
  try {
    const sequelize = User.sequelize;
    
    const authors = await sequelize.query(`
      SELECT DISTINCT u.id, CONCAT(u.firstName, ' ', u.lastName) as name, u.uf
      FROM Users u
      INNER JOIN Publications p ON u.id = p.user_id
      ORDER BY u.firstName ASC
    `, { type: QueryTypes.SELECT });

    const options = authors.map(author => ({
      value: author.id,
      label: `${author.name} (${author.uf})`
    }));

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar autores", error: error.message });
  }
});

// Opções para filtros de UF
router.get('/states', protectADM, async (req, res) => {
  try {
    const sequelize = User.sequelize;
    
    const states = await sequelize.query(`
      SELECT DISTINCT u.uf
      FROM Users u
      INNER JOIN Publications p ON u.id = p.user_id
      WHERE u.uf IS NOT NULL
      ORDER BY u.uf ASC
    `, { type: QueryTypes.SELECT });

    const options = states.map(state => ({
      value: state.uf,
      label: state.uf
    }));

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar estados", error: error.message });
  }
});

module.exports = router;