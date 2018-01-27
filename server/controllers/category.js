const Category = require('../models').Category;

module.exports = {
    create(form) {
        return Category
            .create({
                name: form.name
            });
    },
    delete(form) {
        return Category
            .destroy({
                where: {
                    name: form.name
                }
            });
    },
    listAll() {
        return Category
            .findAll();
    },
    edit(form) {
        return Category
            .findOne({
                where: {
                    id: form.id
                }
            })
            .then(category => {
                return category.update({
                        name: form.name
                    });
            });
    }
};
