module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: 5,
                    msg: 'Username must be 5 characters in length'
                }
            }
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Please enter a valid email address'
                }
            }
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: 8,
                    msg: 'Password must be 8 characters in length'
                }
            }
        },
        moderator: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: false
    });

    return User;
};
