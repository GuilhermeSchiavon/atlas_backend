const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const Publication = sequelize.define('Publication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  body_location: {
    type: DataTypes.ENUM('glande', 'escroto', 'prepucio', 'corpo_peniano', 'regiao_inguinal', 'perianal', 'outro'),
    allowNull: false
  },
  patient_age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  patient_skin_color: {
    type: DataTypes.ENUM('clara', 'morena', 'negra', 'amarela', 'indigena'),
    allowNull: true
  },
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Chapters',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Publication.sync({force: true})

module.exports = Publication;