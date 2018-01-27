const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
let config = {};

try {
    config = require(`${__dirname}/../config/config.json`)[env];
} catch (err) {
    console.log('Create and configure a config.json or use enviroment variables.');
}

const database = config.database || process.env.POSTGRES_DATABASE;
const user = config.username || process.env.POSTGRES_USER;
const password = config.password || process.env.POSTGRES_PASSWORD;
const host = config.host || process.env.POSTGRES_HOST;
const dialect = config.dialect || process.env.POSTGRES_DIALECT;
const port = config.port || process.env.POSTGRES_PORT;

const sequelize = new Sequelize(database, user, password, { host, dialect, port });

const Category = sequelize.import('./Category.js');
const Menu = sequelize.import('./Menu.js');
const User = sequelize.import('./User.js');

Category.hasMany(Menu, { onDelete: 'CASCADE' });
Menu.belongsTo(Category, { onDelete: 'CASCADE' });

sequelize.sync({ force: false });

exports.Category = Category;
exports.Menu = Menu;
exports.User = User;
exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
