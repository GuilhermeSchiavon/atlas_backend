const router = require('express').Router();
const { Category, Publication } = require("../../models");
const { protect } = require('../../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { QueryTypes } = require('sequelize');
    const sequelize = Category.sequelize;
    
    const categories = await sequelize.query(`
      SELECT 
        c.*,
        COALESCE(COUNT(DISTINCT p.id), 0) as publicationCount
      FROM Categories c
      LEFT JOIN PublicationCategories pc ON c.id = pc.category_id
      LEFT JOIN Publications p ON pc.publication_id = p.id AND p.status = 'approved'
      WHERE c.status = 'ativo'
      GROUP BY c.id
      ORDER BY c.id ASC
    `, {
      type: QueryTypes.SELECT
    });

    res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar as categorias!", 
      error: error.message 
    });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { QueryTypes } = require('sequelize');
    const sequelize = Category.sequelize;
    const limit = parseInt(req.query.limit) || 6;
    
    const categories = await sequelize.query(`
      SELECT 
        c.*,
        COALESCE(COUNT(DISTINCT p.id), 0) as publicationCount
      FROM Categories c
      LEFT JOIN PublicationCategories pc ON c.id = pc.category_id
      LEFT JOIN Publications p ON pc.publication_id = p.id AND p.status = 'approved'
      WHERE c.status = 'ativo'
      GROUP BY c.id
      HAVING publicationCount > 0
      ORDER BY publicationCount DESC, c.id ASC
      LIMIT ?
    `, {
      replacements: [limit],
      type: QueryTypes.SELECT
    });

    res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar as categorias em destaque!", 
      error: error.message 
    });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const category = await Category.create({
      title,
      description,
      slug,
      status: 'ativo'
    });

    res.status(201).json({ category });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao criar categoria!", 
      error: error.message 
    });
  }
});

router.get('/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    let category;
    
    // Try to find by ID first (if numeric), then by slug
    if (/^\d+$/.test(idOrSlug)) {
      category = await Category.findByPk(idOrSlug);
    } else {
      category = await Category.findOne({ where: { slug: idOrSlug } });
    }
    
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.status(200).json({ category });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar a categoria!", 
      error: error.message 
    });
  }
});

module.exports = router;