//-----------------DEPENDENCIES------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const model = require('./models');

//-----------------CONFIGURATION------------------
const app = express();
const portID = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
   extended: false
}));
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
app.use(express.static('public'));

app.use(require('./server/routes'));

app.listen(portID, () => {
   console.log(`Server's working just fine on port 3000!`);
});
