const dbMysql = require('./mysql');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ejs = require('ejs');

const register = async function(req, res){
  let yourName = req.body.name;
  let email = req.body.email;
  let pass = req.body.password;
  let hash = crypto.createHash('sha256').update(pass).digest('base64');
  try{
    await dbMysql.promisifiedQuery(`INSERT INTO register (name, email, password) 
    VALUES('${yourName}', '${email}', '${hash}');`);
    res.redirect('/login');
    res.end();
  }catch{
    res.redirect('/register');
  }
}

const login = async function(req, res){
  let yourName = req.body.name;
  let yourEmail = req.body.email;
  let pass = req.body.password;
  let logHash = crypto.createHash('sha256').update(pass).digest('base64');
  const rows = await dbMysql.promisifiedQuery(`SELECT * FROM register WHERE name LIKE '${yourName}';`);

  try{
    if(rows.length > 0 && rows[0].password == logHash){
      let token = jwt.sign({email: yourEmail, role: rows[0].role}, 'ShokoDIDit');
      res.set('Set-Cookie', `logInCookie=${token}`);
      res.render('success.ejs', {name: yourName});
      res.end();
    }
  }catch(err){
    let message = 'Your log-in is not valid';
    res.send(message);
  }
}

const logout = function(req, res){
  res.set('Set-Cookie', 'logInCookie=deleted');
  res.redirect('/index.html');
  res.end();
}

module.exports.logout = logout;
module.exports.register = register;
module.exports.login = login;