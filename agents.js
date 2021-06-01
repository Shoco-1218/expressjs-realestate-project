const dbMysql = require('./mysql');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// For agents page
function checkToken(req){
  let cookies = req.header('Cookie');
  const regex = /logInCookie\=([a-zA-Z0-9\.\-\_]+)/;
  let token = cookies.match(regex)[1];
  let decoded;
  try{
    decoded = jwt.verify(token, 'ShokoDIDit')
    return decoded
  }catch(err){
    console.log('Error in decoded: ' + err);
    return null
  }
};

async function loggedIn(withAgentsReplaced, tokenPayload, res){
  const rows = await dbMysql.promisifiedQuery(`SELECT * from register WHERE email LIKE '${tokenPayload.email}'`);
  let helloAgent = `
  <h4 style = "float: right; margin-right: 30px;" > Hello ${rows[0].name} !</h4><br>`
  let greetingWithName = withAgentsReplaced.replace(/@@@greeting@@@/g, helloAgent);
  finish(greetingWithName, res)
}

function finish(body, res){
  res.send(body);
  res.end();
}

const agentsMain = function(req, res){
  fs.readFile(__dirname + '/static/agents.html', 'utf-8', function(err, data){
    if(err){
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Oops, Not found this page!');
      return res.end();
    }
    dbMysql.connection.query('SELECT * FROM agents', function(err, rows, fields){
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      var str = '';
      for (let i = 0; i < 6; i++){
        str += `
        <div>
          <img src = 'images/${rows[i].agents_photo}' 
                alt = "agen1" with = "200px" height = "200px">
          <h4>${rows[i].name}</h4>
          <p>${rows[i].position}</p>
          <p><a href = "#">${rows[i].phone}</a></p>
          <p>${rows[i].email}</p>
        </div>`
      }
      let withAgentsReplaced = data.replace(/@@@agents@@@/g, str);
      let tokenPayload = checkToken(req);
      
      if(tokenPayload && tokenPayload.role == "agent"){
        loggedIn(withAgentsReplaced, tokenPayload, res);
      }else{
        const greetingAgentReplaced = 
              withAgentsReplaced.replace(/@@@greeting@@@/g, ' ');
        finish(greetingAgentReplaced, res);
      }
    })
  })
};

// For more agents function
const moreAgents = async function(req, res){
  const lastNumber = parseInt(req.query.id);
  try{
    let query = `SELECT * FROM agents LIMIT 3 OFFSET ${lastNumber}`;
    let rows = await dbMysql.promisifiedQuery(query);
    str = '';
    for (let i = 0; i < 3; i++){
      str += `
      <div>
        <img src = images/${rows[i].agents_photo} 
          alt = "agen1" with = "200px" height = "200px">
        <h4>${rows[i].name}</h4>
        <p>${rows[i].position}</p>
        <p><a href = "#">${rows[i].phone}</a></p>
        <p>${rows[i].email}</p>
      </div>`
    }
    res.send(str);
    res.end();
  }catch(err){
    console.log('Error in more-agents: ' + err);
    return false;
  }
}

module.exports.agentsMain = agentsMain;
module.exports.moreAgents = moreAgents;
