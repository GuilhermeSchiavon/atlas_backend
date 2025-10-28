const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { Image, Publication } = require("../../models");
const { protect } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');
const { logAction } = require('../../middleware/logMiddleware');

// View image
router.get('/:id', protect, async (req, res) => {
  const id = req.params.id;
  
  try {
    const image = await Image.findByPk(id, {
      include: [{ model: Publication }]
    });

    if (!image) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    // Check if user has access to this image
    if (req.user.accounType !== 'adm' && image.Publication.user_id !== req.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const imagePath = path.resolve(image.path_local);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Arquivo de imagem não encontrado' });
    }

    res.sendFile(imagePath);
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao carregar a imagem!", 
      error: error.message 
    });
  }
});

// Delete image
router.delete('/:id', protect, logAction('delete', 'image'), async (req, res) => {
  const id = req.params.id;
  
  try {
    const image = await Image.findByPk(id, {
      include: [{ model: Publication }]
    });

    if (!image) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    // Check if user has access to delete this image
    if (req.user.accounType !== 'adm' && image.Publication.user_id !== req.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Delete physical file
    if (fs.existsSync(image.path_local)) {
      fs.unlinkSync(image.path_local);
    }

    await image.destroy();

    res.status(200).json({ message: "Imagem excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ 
      message: "Falha ao excluir a imagem!", 
      error: error.message 
    });
  }
});

module.exports = router;