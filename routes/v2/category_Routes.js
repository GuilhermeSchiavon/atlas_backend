require('dotenv').config();
const router = require('express').Router();
const { Sequelize } = require('sequelize');
const { Category } = require("../../models")
const { protect, protectADM } = require('../../middleware/authMiddleware')

    router.post('/', protectADM, async (req, res) => {

        const { ...data }  = req.body;
       
        try {
            const existingCategoria = await Category.findOne({ where: { name: data.name  } });
            if (existingCategoria) {return res.status(500).json({ message: 'Já existe uma Categoria com este nome.' })}
        
            const newCategoria = await Category.create(data);
            
            res.status(201).json({ 
                message: "Categoria criada com sucesso!", 
                item: newCategoria
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao criar a Categoria!", 
                error: error.message 
            });
        }
    });

    router.post('/all', async (req, res) => {
        try {
        const categorias = await Category.findAll({
            where: {
                status: 'ativo'
            },
            order: ['name']
        });
    
        return res.status(200).json(categorias);

        } catch (error) {
        res.status(500).json({ message: error });
        }
    });

    router.get("/", protectADM, async (req, res) => {
        try {
            const keyword = req.query.keyword || "";
            const pageNumber = Number(req.query.pageNumber) || 1;
            const idCategory = req.query.idCategory > 0 ? Number(req.query.idCategory) : null;
            const pageSize = 12;
            const offset = (pageNumber - 1) * pageSize;
            const orderColumn =  String(req.query.orderColumn) || 'id';
            const orderSort = String(req.query.orderSort) || 'ASC';
            const order = [[Sequelize.literal(orderColumn), orderSort]];

            var whereCategory;
            if (idCategory !== null) {
                whereCategory = {
                'id': idCategory,
                }
            }
            const { count, rows: itens } = await Category.findAndCountAll({
                where: {
                    name: {
                        [Sequelize.Op.like]: `%${keyword}%`,
                    },
                },
                limit: pageSize,
                offset,
                order
            });

            res.status(200).json({
                itens,
                pageNumber,
                pages: Math.ceil(count / pageSize),
                total: count
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Internal Server Error" })
        }
    })

    router.get('/:id', protectADM, async (req, res) => {
        const id = req.params.id;
        try {
            const existingCategoria = await Category.findByPk(id);
        
            res.status(200).json({item: existingCategoria });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao carregar a Categoria!", 
                error: error.message 
            });
        }
    })

    router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const data = req.body;
        try {
            const existingCategoria = await Category.findByPk(id);
        
            if (!existingCategoria) {
            return res.status(404).json({ 
                message: 'Categoria não encontrada',
                error: error.message 
            });
            }
        
            await existingCategoria.update(data);

            res.status(200).json({existingCategoria, message: "Categoria Atualizada"});
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao atualizar a Categoria!", 
                error: error.message 
            });
        }
    });

    router.delete('/:id', protectADM, async (req, res) => {
        const id = req.params.id;
        try {
            const existingCategoria = await Category.findByPk(id);
    
            if (!existingCategoria) {
                return res.status(404).json({ 
                    message: 'Categoria não encontrada',
                    error: error.message 
                });
            }
            const transaction = await Category.sequelize.transaction();

            await existingCategoria.destroy({ transaction });
    
            await transaction.commit();
    
            res.status(200).json({ message: "Capitalize_singular excluído com sucesso!" });
        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({ 
                message: "Falha ao excluir a Capitalize_singular!", 
                error: error.message 
            });
        }
    })
    
module.exports = router