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

const addToCart = (id, obj) => {
    for( let el in obj ) {
        if(obj[el].id === id) {
            obj[el].count++;
        }
    }
};

//-----------------HOME ROUTE------------------

router.get('/', (req, res) => {
    console.log("user", req.session.user);
    console.log("message", req.query.message);

    let page = {};

    if(!req.session.cart){
        req.session.cart = {};
    }

    page.user = req.session.user;

    if(page.user) {
        if(page.user.username === 'Admin') {
            page.admin = true;
        }
    }

    page.cart = req.session.cart;
    page.message = req.query.message;
    page.alert = req.query.alert;

    page.total = total(page.cart);

    Menu.entries().then(menu => page.menu = menu)
    .then(() => Menu.listAll(0)
        .then(menu => page.menu = menu)
        .then(() => res.render('home', page))
    );
});
//-----------------jQUERY ROUTES------------------

router.get('/jquery/clearCart', (req,res) => {
    req.session.cart = {};
    req.session.save(err => res.send(true))
})

router.get('/jquery/add', (req,res) => {
    const entryId = req.query.input;
    let count = req.query.count;

    console.log("count me", req.session.cart);

    for (let entry in req.session.cart) {
        if (entry === entryId) {
            count = +req.session.cart[entry].count + +count;
        }
    }

    Menu.findOne(entryId).then(entry => {

        let newEntry = Object.assign(entry.dataValues,{count: count})
        req.session.cart = Object.assign(req.session.cart,{[entryId]: newEntry})

        console.log("hi there", req.session.cart);
        req.session.save(err => res.send(req.session.cart))
    });
});

router.get('/jquery/username', (req,res) => {
    const username = req.query.username;

    User.search(username).then(user => {
        if(!user){
            res.send(false);
        } else {
            res.send(true);
        }
    })
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
    console.log(total(req.session.cart));
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
            res.redirect(`/?alert=<strong>Success!</strong> your order has been made.`);
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
    page.message = req.query.message;
    console.log(page.message);

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
    let form = {};
    if(req.session.user) {
        if(req.session.user.moderator){
            switch(req.params.type) {
                case "category":
                    form = { name: req.body.category };
                    Category.create(form);
                    break;

                case "menu":
                    form = {
                        name: req.body.name,
                        price: req.body.price,
                        category: req.body.category
                    }
                    Menu.create(form);
                    break;

                case "moderator":
                    if(req.session.user.username === 'Admin') {
                        let username = req.body.name;
                        User.search(username).then(user => User.mod(user));
                    } else {
                        res.redirect('/?message=' + 'You do not have permission')
                        return;
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

router.post('/rmv/:type', (req,res) => {
    let form = {};
    if(req.session.user) {
        if(req.session.user.moderator){
            switch(req.params.type) {
                case "category":
                    form = { name: req.body.category };
                    Category.delete(form);
                    break;

                case "menu":
                    form = {
                        name: req.body.name,
                        price: req.body.price,
                        category: req.body.category
                    }
                    Menu.delete(form);
                    break;

                case "moderator":
                    if(req.session.user.username === 'Admin') {
                        let username = req.body.name;
                        if(username === 'Admin'){
                            res.redirect('/edit?message=' + 'You cannot unmod an Admin')
                        } else {
                            User.search(username).then(user => User.unmod(user));
                        }
                        return;
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
    req.session.save(err => res.redirect('/'))
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
    page.alert = req.query.alert;

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
        .catch(err => res.status(400).redirect(`/register?alert=${err.message.replace(/Validation|error|:+/g,"")}`));
})

router.post('/login', (req, res) => {
    const form = {
        username: req.body.username,
        password: req.body.password
    }

    console.log("hello");

    return User
        .search(form.username)
        .then(user => {
            if (user) {
                bcrypt.compare(form.password, user.password, (err, data) => {
                    if (err) {
                        throw err;
                    }
                    if (data) {
                        req.session.user = user;
                        req.session.save(err => res.redirect('/'))
                    } else {
                        res.status(400).redirect(`/login?alert=Invalid Username or Password`)
                    }

                });
            } else {
                res.status(400).redirect(`/login?alert=Invalid Username or Password`)
            }
        })
        .catch(err => res.status(400).redirect(`/login`));
})


module.exports = router;
