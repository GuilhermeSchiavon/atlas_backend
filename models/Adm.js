const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db")

const Adm = sequelize.define('Adm', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'pendente', 'banida'),
    allowNull: false,
    defaultValue: 'pendente'
  }
});

// Adm.sync({force: true})        // Criação da Tabela

module.exports = Adm;