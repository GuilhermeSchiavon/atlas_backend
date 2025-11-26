// const sequelize = require("../config/db");
// sequelize.sync().then(() => { console.log('Sequelize.sync success!') });

const Adm = require('./Adm');
const Category = require('./Category');
const Image = require('./Image');
const User = require('./User');
const Publication = require('./Publication');
const PublicationCategory = require('./PublicationCategory');
const ActionLog = require('./ActionLog');
const LegalPage = require('./LegalPage');

// Relationships
Category.belongsToMany(Publication, { through: PublicationCategory, foreignKey: 'category_id' });
Publication.belongsToMany(Category, { through: PublicationCategory, foreignKey: 'publication_id' });

User.hasMany(Publication, { foreignKey: 'user_id' });
Publication.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });

Adm.hasMany(Publication, { foreignKey: 'approved_by' });
Publication.belongsTo(Adm, { foreignKey: 'approved_by', as: 'Approver' });

Publication.hasMany(Image, { foreignKey: 'publication_id' });
Image.belongsTo(Publication, { foreignKey: 'publication_id' });

User.hasMany(ActionLog, { foreignKey: 'user_id' });
ActionLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    Adm,
    Category,
    Image,
    User,
    Publication,
    PublicationCategory,
    ActionLog,
    LegalPage,
};