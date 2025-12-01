const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { Sequelize } = require('sequelize');
const { Adm, Publication, Image, User, Category, PublicationCategory } = require("../../models");
const { verify, protect, protectADM } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');
const { logAction } = require('../../middleware/logMiddleware');
const emailService = require('../../services/emailService');

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
router.post('/', protect, requireRole(['associado', 'adm']), upload.array('images', 10), logAction('create', 'publication'), async (req, res) => {
  const transaction = await Publication.sequelize.transaction();
  
  try {
    const { title, description, diagnosis, body_location, patient_age, patient_skin_color, category_ids, image_descriptions, checklist_data } = req.body;
    
    const publication = await Publication.create({
      title,
      description,
      diagnosis,
      body_location,
      patient_age: patient_age ? parseInt(patient_age) : null,
      patient_skin_color,
      user_id: req.userId,
      status: 'pending',
      checklist_data: checklist_data ? JSON.parse(checklist_data) : null
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
      const descriptions = Array.isArray(image_descriptions) ? image_descriptions : [image_descriptions];
      
      const imagePromises = req.files.map((file, index) => {
        return Image.create({
          publication_id: publication.id,
          filename: file.filename,
          path_local: file.path,
          format: path.extname(file.originalname).toLowerCase(),
          size: file.size,
          order: index + 1,
          description: descriptions[index] || null
        }, { transaction });
      });
      
      await Promise.all(imagePromises);
    }

    await transaction.commit();
    
    // Enviar notificação para administradores
    try {
      const author = await User.findByPk(req.userId);
      await emailService.sendNewPublicationNotification(publication, author);
    } catch (emailError) {
      console.error('Erro ao enviar notificação para administradores:', emailError);
      // Não falha a criação da publicação se o email não for enviado
    }
    
    res.status(201).json({ 
      message: "Publicação criada com sucesso!", 
      item: publication 
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: "Falha ao criar a publicação!", 
      error: error.message 
    });
  }
});

// Upload route for backward compatibility
router.post('/upload', protect, requireRole(['associado', 'adm']), (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. Limite: 10MB' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Muitos arquivos. Limite: 10 imagens' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, logAction('create', 'publication'), async (req, res) => {
  const transaction = await Publication.sequelize.transaction();
  
  try {
    const { title, description, diagnosis, body_location, patient_age, patient_skin_color, category_ids, image_descriptions, checklist_data } = req.body;
    
    if (!title || !diagnosis || !body_location) {
      console.log('Missing required fields:', { title: !!title, diagnosis: !!diagnosis, body_location: !!body_location });
      return res.status(400).json({ 
        error: "Campos obrigatórios: title, diagnosis, body_location" 
      });
    }
    
    const publication = await Publication.create({
      title,
      description,
      diagnosis,
      body_location,
      patient_age: patient_age ? parseInt(patient_age) : null,
      patient_skin_color,
      user_id: req.userId,
      status: 'pending',
      checklist_data: checklist_data ? JSON.parse(checklist_data) : null
    }, { transaction });

    // Associate with categories
    if (category_ids && category_ids.length > 0) {
      const categoryIds = Array.isArray(category_ids) ? category_ids : [category_ids];
      const categoryAssociations = categoryIds.map(categoryId => ({
        publication_id: publication.id,
        category_id: parseInt(categoryId)
      }));
      await PublicationCategory.bulkCreate(categoryAssociations, { transaction });
    }

    if (req.files && req.files.length > 0) {
      const descriptions = Array.isArray(image_descriptions) ? image_descriptions : [image_descriptions];
      
      const imagePromises = req.files.map((file, index) => {
        return Image.create({
          publication_id: publication.id,
          filename: file.filename,
          path_local: file.path,
          format: path.extname(file.originalname).toLowerCase(),
          size: file.size,
          order: index + 1,
          description: descriptions[index] || null
        }, { transaction });
      });
      
      await Promise.all(imagePromises);
    }

    await transaction.commit();
    
    // Enviar notificação para administradores (não bloqueia se falhar)
    setImmediate(async () => {
      try {
        const author = await User.findByPk(req.userId);
        await emailService.sendNewPublicationNotification(publication, author);
      } catch (emailError) {
        console.error('Erro ao enviar notificação para administradores:', emailError);
      }
    });
    
    res.status(201).json({ 
      message: "Publicação criada com sucesso!", 
      publication 
    });
  } catch (error) {
    console.error('Upload error:', error);
    await transaction.rollback();
    return res.status(500).json({ 
      error: error.message || "Something went wrong!" 
    });
  }
});

// List publications
router.get('/', verify, async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    const status = req.query.status || null;
    const uf = req.query.uf || null;
    const body_location = req.query.body_location || null;
    const patient_skin_color = req.query.patient_skin_color || null;
    const user_id = req.query.user_id || req.query['Author.id'] || null;
    const category_ids = req.query.category_ids ? 
      (Array.isArray(req.query.category_ids) ? 
        req.query.category_ids.map(id => parseInt(id)) : 
        req.query.category_ids.split(',').map(id => parseInt(id))
      ) : null;
    const Categories = req.query['Categories[]'] || req.query.Categories || null;
    const offset = (pageNumber - 1) * pageSize;

    let whereClause = {};
    
    if (keyword) {
      whereClause[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.like]: `%${keyword}%` } },
        { diagnosis: { [Sequelize.Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (status) whereClause.status = status;
    if (body_location) whereClause.body_location = body_location;
    if (patient_skin_color) whereClause.patient_skin_color = patient_skin_color;

    const isProfileView = req.query.profile === 'true';
    
    if (isProfileView && req.userId) {
      // Para visualização do perfil: mostrar todas as publicações do usuário
      whereClause.user_id = req.userId;
    } else if (req.userId) {
      // Para visualização pública com usuário logado: mostrar apenas aprovadas
      if (!req.isAdm) {
        // Usuário comum: apenas aprovadas na view pública
        whereClause.status = 'approved';
      }
    } else {
      // Usuário não logado: apenas aprovadas
      whereClause.status = 'approved';
    }

    let includeClause = [
      { model: Category, attributes: ['id', 'title', 'description', 'slug'] },
      { model: User, as: 'Author', attributes: ['firstName', 'lastName', 'uf'] },
      // { model: Image, attributes: ['id', 'filename', 'path_local', 'description', 'order'] }
    ];
    
    // Filter by categories if specified
    if (category_ids && category_ids.length > 0) {
      includeClause[0].where = { id: { [Sequelize.Op.in]: category_ids } };
      includeClause[0].required = true;
    } else if (Categories) {
      const categoryFilter = Array.isArray(Categories) ? Categories : [Categories];
      includeClause[0].where = { id: { [Sequelize.Op.in]: categoryFilter.map(id => parseInt(id)) } };
      includeClause[0].required = true;
    }
    
    // Filter by user UF if specified
    if (uf) {
      includeClause[1].where = { ...includeClause[1].where, uf: uf };
      includeClause[1].required = true;
    }
    
    // Filter by specific author if specified
    if (user_id) {
      includeClause[1].where = { ...includeClause[1].where, id: parseInt(user_id) };
      includeClause[1].required = true;
    }

    const { count, rows: itens } = await Publication.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      itens,
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
router.get('/:id', protect, async (req, res) => {
  const id = req.params.id;
  try {
    const item = await Publication.findByPk(id, {
      include: [
        { model: Category },
        { model: User, as: 'Author', attributes: ['firstName', 'lastName', 'image'] },
        { model: Adm, as: 'Approver', attributes: ['firstName', 'lastName'] },
        { model: Image, attributes: ['id', 'filename', 'path_local', 'description', 'order'] }
      ]
    });

    if (!item) {
      return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    // Public can see approved publications, users can see their own
    if (item.status !== 'approved' && (!req.userId || item.user_id !== req.userId && !req.isAdm)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar a publicação!", 
      error: error.message 
    });
  }
});

// Update publication (admin only)
router.put('/:id', protectADM, upload.array('images', 10), logAction('update', 'publication'), async (req, res) => {
  const id = req.params.id;
  const transaction = await Publication.sequelize.transaction();

  try {
    const publication = await Publication.findByPk(id);

    if (!publication) {
      return res.status(404).json({ message: 'Publicação não encontrada' });
    }

    let { images_to_delete, existing_images, ...data } = req.body;

    // Update publication data
    await publication.update({
      ...data,
      patient_age: data.patient_age && data.patient_age != "" ? parseInt(data.patient_age) : null,
      approved_by: req.userId,
    }, { transaction });

    // Handle image deletions
    if (images_to_delete) {
      const imageIds = JSON.parse(images_to_delete);
      await Image.destroy({ 
        where: { id: { [Sequelize.Op.in]: imageIds } }, 
        transaction 
      });
    }

    // Handle existing image updates
    if (existing_images) {
      const existingUpdates = JSON.parse(existing_images);
      for (const update of existingUpdates) {
        await Image.update(
          { description: update.description },
          { where: { id: update.id }, transaction }
        );
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const descriptions = Array.isArray(req.body.image_descriptions) ? 
        req.body.image_descriptions : [req.body.image_descriptions];
      
      const imagePromises = req.files.map((file, index) => {
        return Image.create({
          publication_id: publication.id,
          filename: file.filename,
          path_local: file.path,
          format: path.extname(file.originalname).toLowerCase(),
          size: file.size,
          order: index + 1,
          description: descriptions[index] || null
        }, { transaction });
      });
      
      await Promise.all(imagePromises);
    }

    await transaction.commit();

    res.status(200).json({ 
      message: `Publicação atualizada com sucesso!`,
      item: publication 
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: "Falha ao atualizar a publicação!", 
      error: error.message 
    });
  }
});

// Delete publication
router.delete('/:id', protectADM, logAction('delete', 'publication'), async (req, res) => {
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