const Menu = require('../models').Menu;

module.exports = {
    create(form) {
        return Menu
            .create({
                name: req.body.name,
                price: req.body.price,
                categoryId: req.body.category
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
    delete(menu) {
        return Menu
            .destroy({
                where: {
                    name: menu
                }
            })
    },
    entries() {
        return Menu.findAll();
    },
    listAll(pageNo) {
        return Menu.findAll({ offset: pageNo, limit: 5 })
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
