// EXEMPLO DE MODELO DE ROTAS


// Capitalize_singular = Exemplo

// ARTIGO = a ou o
// VAR_MESSAGE_CAPITALIZE = ExemploPortuguês

const { Sequelize } = require('sequelize');
const router = require('express').Router();
const { Capitalize_singular } = require("../../models")
const { protect, protectADM } = require('../../middleware/authMiddleware')

    router.post('/', protectADM, async (req, res) => {
        const { ...data }  = req.body;
        try {
            const existingCapitalize_singular = await Capitalize_singular.findOne({ where: { name: data.name }});
            if (existingCapitalize_singular) {return res.status(500).json({ message: 'Já existe VAR_MESSAGE_CAPITALIZE com este nome.' })}
        
            const newCapitalize_singular = await Capitalize_singular.create(data);
            
            res.status(201).json({ 
                message: "VAR_MESSAGE_CAPITALIZE criadARTIGO com sucesso!", 
                item: newCapitalize_singular
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao criar ARTIGO VAR_MESSAGE_CAPITALIZE!", 
                error: error.message 
            });
        }
    });

    router.get("/", protect, async (req, res) => {
        try {
            const keyword = String(req.query.keyword) || "";
            const pageNumber = Number(req.query.pageNumber) || 1;
            const pageSize = Number(req.query.pageSize) || 12;
            const offset = (pageNumber - 1) * pageSize;
            const orderColumn =  String(req.query.orderColumn) || 'id';
            const orderSort = String(req.query.orderSort) || 'ASC';
            const order = [[Sequelize.literal(orderColumn), orderSort]];

            const { count, rows: items } = await Capitalize_singular.findAndCountAll({
                where: {
                    [Sequelize.Op.or]: [
                        { name: { [Sequelize.Op.like]: `%${keyword}%` } },
                        { status: { [Sequelize.Op.like]: `%${keyword}%` } },
                    ]
                },
                limit: pageSize,
                offset,
                order
            });

            res.status(200).json({
                items,
                pageNumber,
                pages: Math.ceil(count / pageSize),
                total: count
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao carregar ARTIGOs VAR_MESSAGE_CAPITALIZEs!", 
                error: error.message 
            });
        }
    });

    router.get('/:id', protect, async (req, res) => {
        const id = req.params.id;
        try {
            const existingCapitalize_singular = await Capitalize_singular.findByPk(id);
        
            res.status(200).json({item: existingCapitalize_singular });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao carregar ARTIGO VAR_MESSAGE_CAPITALIZE!", 
                error: error.message 
            });
        }
    })

    router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const data = req.body;
        try {
            const existingCapitalize_singular = await Capitalize_singular.findByPk(id);
        
            if (!existingCapitalize_singular) {
                return res.status(404).json({ 
                    message: 'VAR_MESSAGE_CAPITALIZE não encontradARTIGO',
                    error: error.message 
                });
            }
        
            await existingCapitalize_singular.update(data);

            res.status(200).json({
                message: "VAR_MESSAGE_CAPITALIZE AtualizadARTIGO",
                existingCapitalize_singular,
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao atualizar ARTIGO VAR_MESSAGE_CAPITALIZE!", 
                error: error.message 
            });
        }
    });

    router.delete('/:id', protectADM, async (req, res) => {
        const id = req.params.id;
        try {
            const existingCapitalize_singular = await Capitalize_singular.findByPk(id);

            if (!existingCapitalize_singular) {
                return res.status(404).json({ 
                    message: 'VAR_MESSAGE_CAPITALIZE não encontradARTIGO',
                    error: error.message 
                });
            }
            const transaction = await Capitalize_singular.sequelize.transaction();

            await existingCapitalize_singular.destroy({ transaction });

            await transaction.commit();

            res.status(200).json({ message: "VAR_MESSAGE_CAPITALIZE excluídARTIGO com sucesso!" });
        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({ 
                message: "Falha ao excluir ARTIGO VAR_MESSAGE_CAPITALIZE!", 
                error: error.message 
            });
        }
    })
    
module.exports = router