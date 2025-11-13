const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { Sequelize } = require('sequelize');
const { Publication, Image, User, Category, PublicationCategory } = require("../../models");
const { verify, protect } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');
const { logAction } = require('../../middleware/logMiddleware');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/publications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Create publication with images
router.post('/upload', protect, requireRole(['associado', 'adm']), upload.array('images', 10), logAction('create', 'publication'), async (req, res) => {
  const transaction = await Publication.sequelize.transaction();
  
  try {
    const { title, description, diagnosis, body_location, patient_age, patient_skin_color, category_ids } = req.body;
    
    const publication = await Publication.create({
      title,
      description,
      diagnosis,
      body_location,
      patient_age: patient_age ? parseInt(patient_age) : null,
      patient_skin_color,
      user_id: req.userId,
      status: 'pending'
    }, { transaction });

    // Associate with categories
    if (category_ids && category_ids.length > 0) {
      const categoryAssociations = category_ids.map(categoryId => ({
        publication_id: publication.id,
        category_id: parseInt(categoryId)
      }));
      await PublicationCategory.bulkCreate(categoryAssociations, { transaction });
    }

    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return Image.create({
          publication_id: publication.id,
          filename: file.filename,
          path_local: file.path,
          format: path.extname(file.originalname).toLowerCase(),
          size: file.size,
          order: index + 1
        }, { transaction });
      });
      
      await Promise.all(imagePromises);
    }

    await transaction.commit();
    
    res.status(201).json({ 
      message: "Publicação criada com sucesso!", 
      publication 
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: "Falha ao criar a publicação!", 
      error: error.message 
    });
  }
});

// List publications
router.get('/', verify, async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 12;
    const status = req.query.status || null;
    const category_ids = req.query.category_ids ? 
      (Array.isArray(req.query.category_ids) ? 
        req.query.category_ids.map(id => parseInt(id)) : 
        req.query.category_ids.split(',').map(id => parseInt(id))
      ) : null;
    const offset = (pageNumber - 1) * pageSize;

    let whereClause = {
      [Sequelize.Op.or]: [
        { title: { [Sequelize.Op.like]: `%${keyword}%` } },
        { diagnosis: { [Sequelize.Op.like]: `%${keyword}%` } }
      ]
    };
    if (status) whereClause.status = status;


    // Public can see approved publications, users can see their own

    if (req.userId) {
      const user = await User.findByPk(req.userId);
      if (user && user.accounType !== 'adm') {
        whereClause.user_id = req.userId;
      }
    } else {
      whereClause.status = 'approved';
    }

    let includeClause = [
      { model: Category, attributes: ['id', 'title', 'description', 'slug'] },
      { model: User, as: 'Author', attributes: ['firstName', 'lastName'] },
      { model: Image, attributes: ['id', 'filename', 'path_local'] }
    ];
    // Filter by categories if specified
    if (category_ids && category_ids.length > 0) {
      includeClause[0].where = { id: { [Sequelize.Op.in]: category_ids } };
      includeClause[0].required = true;
    }

    const { count, rows: publications } = await Publication.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      publications,
      pageNumber,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar as publicações!", 
      error: error.message 
    });
  }
});

// Get single publication
router.get('/:id', verify, async (req, res) => {
  const id = req.params.id;
  try {
    const publication = await Publication.findByPk(id, {
      include: [
        { model: Category },
        { model: User, as: 'Author', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'Approver', attributes: ['firstName', 'lastName'] },
        { model: Image }
      ]
    });

    if (!publication) {
      return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    // Public can see approved publications, users can see their own
    if (publication.status !== 'approved' && (!req.userId || publication.user_id !== req.userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.status(200).json({ publication });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar a publicação!", 
      error: error.message 
    });
  }
});

// Approve/Reject publication (admin only)
router.put('/approve/:id', protect, requireRole(['adm']), logAction('approve', 'publication'), async (req, res) => {
  const id = req.params.id;
  const { status, rejection_reason } = req.body;

  try {
    const publication = await Publication.findByPk(id);

    if (!publication) {
      return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    await publication.update({
      status,
      approved_by: req.userId,
      rejection_reason: status === 'rejected' ? rejection_reason : null
    });

    res.status(200).json({ 
      message: `Publicação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`,
      publication 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao atualizar a publicação!", 
      error: error.message 
    });
  }
});

// Delete publication
router.delete('/:id', protect, logAction('delete', 'publication'), async (req, res) => {
  const id = req.params.id;
  const transaction = await Publication.sequelize.transaction();

  try {
    const publication = await Publication.findByPk(id);

    if (!publication) {
      return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    // Users can only delete their own publications, admins can delete any
    if (req.user.accounType !== 'adm' && publication.user_id !== req.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    await Image.destroy({ where: { publication_id: id }, transaction });
    await publication.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ message: "Publicação excluída com sucesso!" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: "Falha ao excluir a publicação!", 
      error: error.message 
    });
  }
});

module.exports = router;