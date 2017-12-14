const express = require('express');
const router = express.Router();
const User = require('../controllers').User;
const Menu = require('../controllers').Menu;
const Categroy = require('../controllers').Category;
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    console.log("user", req.session.user);
    console.log("cart", req.session.cart);
    let page = {};
    if (!req.session.cart) {
        req.session.cart = {
            3: {
                id: 1,
                name: "All cheese pizza",
                price: 11
            },
            4: {
                id: 2,
                name: "Heineken Beer",
                price: 12
            }
        }
    }
    page.user = req.session.user;
    page.cart = req.session.cart;
    page.message = req.query.message;

    Menu.entries().then(entry => {
        page.pages = entry.length;
    })

    Menu.listAll(0).then(menu => {
        page.menu = menu;
    })


    res.render('home', page);
});

//-----------------CART ROUTES------------------

router.get('/myCart', (req,res) => {
    let page = {};

    page.cart = req.session.cart
    res.render('payment')
})

router.get('/clearCart', (req,res) => {
    req.session.cart = undefined;
    res.redirect('/')
})

//-----------------FORM ROUTES------------------

router.get('/logout', (req,res) => {
    req.session.user = undefined;
    res.redirect('/');
})

router.get('/:form', (req, res) => {
    let page = {};

    const form = [{
            form: "register",
            pageName: "Register",
            linkName: "Login",
            href: "login",
            input1: "text",
            input2: "text",
            input3: "password",
            input4: "password"
        },
        {
            form: "login",
            pageName: "Login",
            linkName: "Register",
            href: "register",
            input1: "text",
            input3: "password",
        }
    ];

    const route = form.find(element => element.form === req.params.form);

    page = Object.assign(page, route);

    page.user = req.session.user;
    page.message = req.query.message;

    res.render('form', page);
})

router.post('/register', (req, res) => {
    const form = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    return User
        .build(form)
        .validate()
        .then(user => User.create(user).then(() => res.redirect('/login')))
        .catch(err => res.status(400).redirect(`/register?message=${err.message.replace(/Validation|error|:+/g,"")}`));
})

router.post('/login', (req, res) => {
    const form = {
        username: req.body.username,
        password: req.body.password
    }

    return User
        .search(form)
        .then(user => {
            if (user) {
                bcrypt.compare(form.password, user.password, (err, data) => {
                    if (err) {
                        throw err;
                    }
                    if (data) {
                        req.session.user = user;
                        res.redirect('/');
                    } else {
                        res.status(400).redirect(`/login?message=Invalid Username or Password`)
                    }

                });
            } else {
                res.status(400).redirect(`/login?message=Invalid Username or Password`)
            }
        })
        .catch(err => res.status(400).redirect(`/login`));
})

module.exports = router;
