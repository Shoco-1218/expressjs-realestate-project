const express = require('express');
const app = express();
const port = 3000;
const agents = require('./agents');
const logAndRegister = require('./logAndRegister');
const property = require('./property');


app.get('/agents', agents.agentsMain);
app.get('/moreAgents', agents.moreAgents);

app.get('/property', property.propertyMain);
app.get('/gallery', property.individualProperty);
app.post('/moreproperty', property.addProperty);


app.set('view engine', 'ejs');
app.use(express.json()); 
app.use(express.urlencoded({extended : true}));

app.get('/register', (req, res) => {
  res.render('register.ejs');
})
app.post('/register', logAndRegister.register);

app.get('/login', (req, res) => {
  res.render('login.ejs');
})
app.post('/login', logAndRegister.login);

app.post('/logout', logAndRegister.logout);


app.use(express.static('static'));


app.listen(port, () => {
  console.log('Connecting with server 3000....');
});
