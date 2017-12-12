module.exports = (sequelize, Datatypes) => {
    const Menu = sequelize.define('Menu', {
        name: {
            type: Datatypes.STRING,
            unique: true,
            allowNull: false
        },
        price: {
            type: Datatypes.INTEGER,
            allowNull: false
        }
    });

    Menu.associate = (models) => {
        Menu.hasmany(models.Category, {
            foreignKey: 'categoryId'
        });
    };
}
