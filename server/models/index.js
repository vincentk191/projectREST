const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/config.json`)[env];
const sequelize = new Sequelize(config.use_env_variable || process.env.DATABASE_URL);

const Category = sequelize.import('./Category.js');
const Menu = sequelize.import('./Menu.js');
const User = sequelize.import('./User.js');

Category.hasMany(Menu, {onDelete: 'CASCADE' });
Menu.belongsTo(Category, {onDelete: 'CASCADE' });

sequelize.sync({ force: false });

exports.Category = Category;
exports.Menu = Menu;
exports.User = User;
exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
