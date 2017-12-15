//-----------------DEPENDENCIES------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const paypal = require('paypal-rest-sdk');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const model = require('../server/models');

//-----------------CONFIGURATION------------------
const app = express();
const portID = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
   extended: false
}));

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZGLmnJSzE9IydzugsfSBGVMk32LZuzqofZ211uT7tPyU4zB0PIFFluGK8g4OCtpyPGvAi7NRy9dUV6X',
  'client_secret': 'ENWNjQvCp_IRfUBGkrGXf2G9LBbkZvacW6kUKEvKKPUIwHD_gXipIhv_SO4d7g8Nc-PdQNeAsm-dmfic'
});

//-----------------SESSION STORE-------------------
app.use(session({
   store: new SequelizeStore({
      db: model.sequelize,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 60 * 60 * 1000 // The maximum age (in milliseconds) of a valid session.
   }),
   secret: "safe",
   saveUnitialized: false,
   resave: false
}))

//--------------------ROUTES----------------------
app.set('view engine', 'pug');

app.set('views', __dirname + '/views/');

app.use(express.static('public'));

app.use(require('../server/routes'));

app.listen(portID, () => {
   console.log(`Server's working just fine on port 3000!`);
});
