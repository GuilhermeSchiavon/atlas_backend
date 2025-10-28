const { DataTypes } = require('sequelize');
const sequelize = require("../config/db")

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo'
  }
});

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Category.sync({force: true})        // Criação da Tabela

module.exports = Category;