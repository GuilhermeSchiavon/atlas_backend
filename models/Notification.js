const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('mention', 'response', 'like', 'follow', 'other'),
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
});

// Relationships
Notification.belongsTo(sequelize.models.User);
Notification.belongsTo(sequelize.models.User, { foreignKey: 'SenderId', as: 'Sender' });
Notification.belongsTo(sequelize.models.Topic);
Notification.belongsTo(sequelize.models.Answer);

module.exports = Notification;
