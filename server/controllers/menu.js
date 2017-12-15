const Menu = require('../models').Menu;

module.exports = {
    create(form) {
        return Menu
            .create({
                name: form.name,
                price: form.price,
                categoryId: form.category
            })
    },
    build(form) {
        return Menu
            .build({
                name: req.body.name,
                price: req.body.price,
                categoryId: req.body.category
            })
    },
    delete(form) {
        return Menu
            .destroy({
                where: {
                    name: form.name
                }
            })
    },
    entries() {
        return Menu.findAll();
    },
    listAll(pageNo) {
        return Menu.findAll({ offset: pageNo, limit: 5 })
    },
    findOne(formId) {
        return Menu
            .findOne({
                where: {
                    id: formId
                }
            })
    },
    search(entry){
        return Menu
            .findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${entry}%`
                    }
                },
                order: [
                    ['name']
                ]
            })
    },
    edit(entry) {
        return Menu
            .findOne({
                where: {
                    id: entry.id
                }
            })
            .then(menu => {
                return menu.update({
                        name: entry.name,
                        price: entry.price,
                        categoryId: entry.categoryId
                    })
            })
    }
};
