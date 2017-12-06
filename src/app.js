const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const fileName = 'file.something'

const app = express();

// const sequelize = new Sequelize ('restMenu',process.env.POSTGRES_USER,null,{
//    host: 'localhost',
//    dialect: 'postgres'
// });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   extended: false
}));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
   res.render('index');
});

var server = app.listen(3000, () => {
   console.log(`Server's working just fine on port 3001!`);
});
