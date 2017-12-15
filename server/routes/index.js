const express = require('express');
const paypal = require('paypal-rest-sdk');
const router = express.Router();
const User = require('../controllers').User;
const Menu = require('../controllers').Menu;
const Category = require('../controllers').Category;
const bcrypt = require('bcrypt');
const portID = process.env.PORT || 3000;

const total = obj => {
    let total = 0;
        for( let el in obj ) {
            total += parseFloat(obj[el].price * obj[el].count);
        }
    return total;
};

//-----------------HOME ROUTE------------------

router.get('/', (req, res) => {
    console.log("user", req.session.user);
    console.log("cart", req.session.cart);

    let page = {};
    if (!req.session.cart) {
        req.session.cart = {
            3: {
                name: "All cheese pizza",
                price: 11,
                count: 1
                // "name": "item",
                // "sku": "item",
                // "price": "1.00",
                // "currency": "USD",
                // "quantity": 1
            },
            4: {
                name: "Heineken Beer",
                price: 4,
                count: 4
            }
        }
    }

    page.user = req.session.user;

    if(page.user) {
        if(page.user.username === 'Admin') {
            page.admin = true;
        }
    }

    page.cart = req.session.cart;
    page.message = req.query.message;

    page.total = total(page.cart);

    Menu.entries().then(menu => page.menu = menu)
    .then(() => Menu.listAll(0)
        .then(menu => page.menu = menu)
        .then(() => res.render('home', page))
    );
});
//-----------------jQUERY ROUTES------------------

router.get('/jquery/filter/:type', (req,res) => {
    switch(req.params.type) {
        case "category":
            break;
        case "moderator":
            break;
        case "menu":
    }
})

router.get('/jquery/clearCart', (req,res) => {
    req.session.cart = undefined;
})
//-----------------CART ROUTES------------------

router.get('/myCart', (req,res) => {
    let page = {};
    page.cart = req.session.cart;
    page.user = req.session.user;

    page.total = total(page.cart);
    console.log(page.total);

    res.render('payment', page)
})

//-----------------PAYPAL ROUTES------------------
router.post('/pay', (req,res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `http://localhost:${portID}/success`,
            "cancel_url": `http://localhost:${portID}/cancel`
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Vincent's Bar",
                    "sku": "1610",
                    "price": `${total(req.session.cart)}`,
                    "currency": "EUR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "EUR",
                // "total": "1.00"
                "total": `${total(req.session.cart)}`
            },
            "description": "Checkout Cart"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            for (var i = 0; i < payment.links.length; i++) {
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
})

router.get('/success', (req,res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": `${total(req.session.cart)}`
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            req.session.cart = undefined;
            res.redirect('/');
        }
    });
});

router.get('/cancel', (req,res) => {
    res.redirect('/myCart');
})
//-----------------PROFILE ROUTES------------------

// MODERATORS
router.get('/edit', (req,res) => {
    let page = {};

    if(req.session.user) {
        if(req.session.user.moderator){
            page.user = req.session.user;
            page.admin = req.session.user.username === 'Admin';
            page.cart = req.session.cart;

            Category.listAll().then(categories => {
                    page.categories = categories;
                })
                .then(() => {
                    Menu.entries().then(menu => page.menu = menu)
                    .then(() => User.moderator()
                        .then(users => {
                            page.users = users
                        })
                        .then(() => res.render('moderator', page))
                    );
                })
        } else {
            res.redirect('/?message=' + 'You need to be an Admin to access this!')
        }
    } else {
        res.redirect('/login')
    }
})

router.post('/edit/:type', (req,res) => {
    console.log('edit forms here \n');
    let form = {};
    if(req.session.user) {
        if(req.session.user.moderator){
            switch(req.params.type) {
                case "category":
                console.log('category');
                    form = { name: req.body.category };
                    Category.create(form);
                    break;

                case "menu":
                console.log('menu');
                    form = {
                        name: req.body.name,
                        price: req.body.price,
                        category: req.body.category
                    }
                    Menu.create(form);
                    break;

                case "moderator":
                    console.log('moderator');
                    if(req.session.user.username === 'Admin') {
                        form = { username: req.body.name };
                        User.search(form).then(user => User.mod(user));
                    } else {
                        res.redirect('/?message=' + 'You do not have permission')
                    }
            }
            res.redirect('/edit')
        } else {
            res.redirect('/?message=' + 'You need to be an Admin to access this!')
        }
    } else {
        res.redirect('/login')
    }
})

// PUBLIC
router.get('/profile/:id', (req,res) => {
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
