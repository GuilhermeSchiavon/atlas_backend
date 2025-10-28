const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const ActionLog = sequelize.define('ActionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.ENUM('create', 'update', 'approve', 'reject', 'delete'),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.ENUM('publication', 'image', 'chapter'),
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
});

// ActionLog.sync({force: true})

module.exports = ActionLog;