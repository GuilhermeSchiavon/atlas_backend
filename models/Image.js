const { DataTypes } = require('sequelize');
const sequelize = require("../config/db")

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  publication_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Publications',
      key: 'id'
    }
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path_local: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path_spaces: {
    type: DataTypes.STRING,
    allowNull: true
  },
  format: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  }
});


// Image.sync({force: true})        // Criação da Tabela

module.exports = Image;
