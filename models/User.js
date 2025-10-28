const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db")

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
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
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  cpf: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  phone_wa: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nacionalidade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  sexo: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  consent_wa: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  acceptMessage_wa: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  check_pesquisa: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_aprovacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  accounType: {
    type: DataTypes.ENUM('adm', 'associado'),
    allowNull: false,
    defaultValue: 'associado'
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'pendente','remido','falecido', 'banida'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  externalId: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// User.sync({force: true})        // Criação da Tabela
// User.sync()

module.exports = User;