// const sequelize = require("../config/db");
// sequelize.sync().then(() => { console.log('Sequelize.sync success!') });

const Adm = require('./Adm');
const Category = require('./Category');
const Image = require('./Image');
const User = require('./User');
const Chapter = require('./Chapter');
const Publication = require('./Publication');
const ActionLog = require('./ActionLog');

// Relationships
Chapter.hasMany(Publication, { foreignKey: 'chapter_id' });
Publication.belongsTo(Chapter, { foreignKey: 'chapter_id' });

User.hasMany(Publication, { foreignKey: 'user_id' });
Publication.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });

User.hasMany(Publication, { foreignKey: 'approved_by' });
Publication.belongsTo(User, { foreignKey: 'approved_by', as: 'Approver' });

Publication.hasMany(Image, { foreignKey: 'publication_id' });
Image.belongsTo(Publication, { foreignKey: 'publication_id' });

User.hasMany(ActionLog, { foreignKey: 'user_id' });
ActionLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    Adm,
    Category,
    Image,
    User,
    Chapter,
    Publication,
    ActionLog,
};