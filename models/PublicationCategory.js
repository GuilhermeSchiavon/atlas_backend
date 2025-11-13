const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const PublicationCategory = sequelize.define('PublicationCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
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
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  }
}, {
  tableName: 'PublicationCategories'
});

module.exports = PublicationCategory;