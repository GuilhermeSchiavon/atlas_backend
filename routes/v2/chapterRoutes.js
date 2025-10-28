const router = require('express').Router();
const { Chapter } = require("../../models");
const { protect } = require('../../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { status: 'ativo' },
      order: [['number', 'ASC']]
    });

    res.status(200).json({ chapters });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar os capítulos!", 
      error: error.message 
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  const id = req.params.id;
  try {
    const chapter = await Chapter.findByPk(id);
    
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