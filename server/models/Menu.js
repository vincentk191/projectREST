module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define('Menu', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: false
    });

    return Menu;
};
