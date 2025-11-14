const express = require('express');
const { LegalPage } = require('../../models');
const router = express.Router();

// GET /api/v2/legal/:type - Buscar página legal por tipo
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['terms', 'privacy'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use "terms" ou "privacy".' });
    }

    const page = await LegalPage.findOne({ where: { type } });
    
    if (!page) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    res.json(page);
  } catch (error) {
    console.error('Erro ao buscar página legal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;