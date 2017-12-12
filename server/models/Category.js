module.exports = (sequelize, Datatypes) => {
    const Category = sequelize.define('Category', {
        name: {
            type: Datatypes.STRING,
            unique: true,
            allowNull: false
        }
    });

    Category.associate = (models) => {
        Category.belongsTo(models.Menu, {
            foreignKey: 'categoryId',
            onDelete: 'CASCADE'
        });
    };
}
