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
    type: DataTypes.STRING(11),
    allowNull: true,
    validate: {
      len: [11, 11],
      isNumeric: true
    }
  },
  crm: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  uf: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      len: [2, 2],
      isUppercase: true
    }
  },
  especialidade: {
    type: DataTypes.ENUM('Urologista', 'Dermatologista'),
    allowNull: false
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
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
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

// User.sync({alter: true})        // Atualização da Tabela
// User.sync()

module.exports = User;