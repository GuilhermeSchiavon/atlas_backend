const router = require('express').Router();
const { Category, Publication } = require("../../models");
const { verify, protect, protectADM } = require('../../middleware/authMiddleware');

router.get('/', verify, async (req, res) => {
  try {
    const { QueryTypes } = require('sequelize');
    const sequelize = Category.sequelize;

    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    const offset = (pageNumber - 1) * pageSize;
    const status = req.query.status || null;
    const keyword = req.query.keyword || "";

    let whereConditions = [];
    let whereConditionsTotal = [];

    // Status filter
    if (!req.isAdm) {
      whereConditions.push("c.status = 'ativo'");
      whereConditionsTotal.push("status = 'ativo'");
    } else if (status) {
      whereConditions.push(`c.status = '${status}'`);
      whereConditionsTotal.push(`status = '${status}'`);
    }

    // Keyword filter
    if (keyword) {
      whereConditions.push(`(c.title LIKE '%${keyword}%' OR c.description LIKE '%${keyword}%')`);
      whereConditionsTotal.push(`(title LIKE '%${keyword}%' OR description LIKE '%${keyword}%')`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const whereClauseTotal = whereConditionsTotal.length > 0 ? `WHERE ${whereConditionsTotal.join(' AND ')}` : '';

    // Total conforme o perfil
    const totalResult = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM Categories 
      ${whereClauseTotal}
    `, { type: QueryTypes.SELECT });

    const total = totalResult[0].total;

    // Lista com join
    const itens = await sequelize.query(`
      SELECT 
        c.*,
        COALESCE(COUNT(DISTINCT p.id), 0) as publicationCount
      FROM Categories c
      LEFT JOIN PublicationCategories pc ON c.id = pc.category_id
      LEFT JOIN Publications p 
        ON pc.publication_id = p.id 
        AND p.status = 'approved'
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.id ASC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { limit: pageSize, offset },
      type: QueryTypes.SELECT
    });

    res.status(200).json({
      itens,
      pageNumber,
      pages: Math.ceil(total / pageSize),
      total
    });

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
      status: 'inativo'
    });

    res.status(201).json({ message: 'Categoria criada com sucesso', item: category });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao criar categoria!", 
      error: error.message 
    });
  }
});

router.put('/:id', protectADM, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const { id } = req.params;

    if (!title) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    await category.update({
      title,
      description,
      slug: title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim(),
        status
    });

    res.status(200).json({ message: 'Categoria atualizada com sucesso', item: category });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao atualizar categoria!", 
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

    res.status(200).json( category );
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar a categoria!", 
      error: error.message 
    });
  }
});

router.delete('/:id', protectADM, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao excluir categoria!", 
      error: error.message 
    });
  }
});

module.exports = router;