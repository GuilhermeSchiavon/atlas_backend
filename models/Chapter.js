const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const Chapter = sequelize.define('Chapter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  qrcode: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo'
  }
});

// Chapter.sync({force: true})

module.exports = Chapter;