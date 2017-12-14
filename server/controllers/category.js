const Category = require('../models').Category;

module.exports = {
    create(req,res) {
        return Category
            .create({
                name:
            })
            .then(user => res.render('', user))
            .catch(err => res.status(400).redirect(`/?message=${err}`))
    },
    delete(req,res) {
        return Category
            .destroy({
                where: {

                }
            })
            .then(user => res.render('', user))
            .catch(err => res.status(400).redirect(`/?message=${err}`))
    },
    listAll(req,res) {
        return Category
            .findAll()
            .then(user => res.render('', user))
            .catch(err => res.status(400).redirect(`/?message=${err}`))
    },
    edit(req,res) {
        return Category
            .findOne({
                where: {

                }
            })
            .then(category => {
                if(!category){

                }

                return category.update({
                    name:
                })
                .then(user => res.render('', user))
                .catch(err => res.status(400).redirect(`/?message=${err}`))
            })
    }
};
