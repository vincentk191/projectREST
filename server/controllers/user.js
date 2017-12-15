const User = require('../models').User;
const bcrypt = require('bcrypt');

module.exports = {
    build(form) {
        console.log("cy@");
        const checkUser = User.build({
            username: form.username,
            password: form.password,
            email: form.email
        });

        return checkUser;
    },
    create(form) {
        return User
            .create({
                username: form.username,
                email: form.email,
                password: bcrypt.hashSync(form.password, 8)
            })
    },
    search(form) {
        return User
            .findOne({
                where: {
                    username: form.username
                }
            })
    },
    delete(form) {
        return User
            .destory({
                where: {
                    id: form.name
                }
            })
    },
    listAll() {
        return User
            .findAll()
    },
    edit(user,form) {
        return user
            .update({
                username: form.username,
                password: form.password
            });
    },
    mod(user) {
        return user
            .update({
                moderator: true
            })
    },
    moderator() {
        return User
            .findAll({
                where: {
                    moderator: true
                },
                order: ['id']
            })
    }
};
