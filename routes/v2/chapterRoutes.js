const router = require('express').Router();
const { Chapter, Publication } = require("../../models");
const { protect } = require('../../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { status: 'ativo' },
      order: [['number', 'ASC']],
      include: [{
        model: Publication,
        attributes: [],
        where: { status: 'approved' },
        required: false
      }],
      attributes: {
        include: [[
          require('sequelize').fn('COUNT', require('sequelize').col('Publications.id')),
          'publicationCount'
        ]]
      },
      group: ['Chapter.id']
    });

    res.status(200).json({ chapters });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar os capítulos!", 
      error: error.message 
    });
  }
});

router.get('/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    let chapter;
    
    // Try to find by ID first (if numeric), then by slug
    if (/^\d+$/.test(idOrSlug)) {
      chapter = await Chapter.findByPk(idOrSlug);
    } else {
      chapter = await Chapter.findOne({ where: { slug: idOrSlug } });
    }
    
    if (!chapter) {
      return res.status(404).json({ message: 'Capítulo não encontrado' });
    }

    res.status(200).json({ chapter });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar o capítulo!", 
      error: error.message 
    });
  }
});

module.exports = router;