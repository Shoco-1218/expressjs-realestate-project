const dbMysql = require('./mysql');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

function logInCookieTokenPayload(req) {
  let cookie = req.header('Cookie');
  const regex = /logInCookie\=([A-Za-z0-9\.\_\-]+)/;
  let token = cookie.match(regex)[1];
  let decoded;
  try{
    decoded = jwt.verify(token, 'ShokoDIDit');
    return decoded;
  }catch{
    return null;
  }
}

function finish(body, res) {
  res.send(body);
  res.end();
}

function loggedIn2(withAgentsReplaced, tokenPayload, res){
  let addForm = `
  <h2 style = "text-align: center; margin-top: 50px">Add more property</h2>
    <div class = "addProperty">
      <form action = "/moreproperty" method = "POST" id = "moreProperty">
        <div class = "marginTop">
          <label for = "address">Address of Property</label><br>
          <input id = "address" type = "text" name = "address" 
                  placeholder="Property Address" size="36" required>
        </div>
        <div class = "marginTop">
          <label for = "inspection">Inspection Date</label><br>
          <input id = "inspection" type = "text" name = "inspection" 
                  placeholder="Open xx/xx/ xx:xxam/pm" size="36"  required>
        </div>
        <div class = "marginTop">
          <label for = "image_path">Tytle of the Image File</label><br>
          <input id = "image_path" type = "text" name = "image_path" 
                  placeholder="example.jpg" size="36"  required>
        </div>
        <div class = "marginTop">
          <label for = "agentName">Agent's name</label>
          <input id = "agentName" type = "text" name = "agentName" 
                  placeholder="Full name" size="36"  required>
        </div>
        <div class = "marginTop">
          <label >The number of Bed Rooms</label>
          <div id="radio">
            1 <input type="radio" name="bed" value="1" >
            2 <input type="radio" name="bed" value="2" >
            3 <input type="radio" name="bed" value="3" >    
            4 <input type="radio" name="bed" value="4" >    
            5 <input type="radio" name="bed" value="5" >    
          </div> 
        </div>
        <div class = "marginTop">
          <label >The number of Shower Rooms</label>
          <div id="radio">
            1 <input type="radio" name="shower" value="1" >
            2 <input type="radio" name="shower" value="2" >
            3 <input type="radio" name="shower" value="3" >    
            4 <input type="radio" name="shower" value="4" >    
            5 <input type="radio" name="shower" value="5" >    
          </div> 
        </div>
        <div class = "marginTop">
          <label >The number of Car Parking</label>
          <div id="radio">
            1 <input type="radio" name="car" value="1" >
            2 <input type="radio" name="car" value="2" >
            3 <input type="radio" name="car" value="3" >    
            4 <input type="radio" name="car" value="4" >    
            5 <input type="radio" name="car" value="5" >    
          </div> 
        </div>
        <button type = 'submit' id = "addPropertyBtn">OK</button>
      </form>
    </div>`;
  let withGreetingAndAgentsReplaced = 
        withAgentsReplaced.replace(/@@@addForm@@@/g, addForm);
  finish(withGreetingAndAgentsReplaced, res)
}

async function propertyMain(req, res){
  let data;
  try{
    data = await readFileAsync(__dirname + '/static/property.html', 'utf-8');
  }catch{
    res.status(404).send('No page found!');
    res.end();
  }

  let rows = await dbMysql.promisifiedQuery(`SELECT property.id, property.address, property.image_path, property.inspection, property.bed, property.shower, property.car, agents.name, agents.agents_photo FROM property JOIN agents ON property.agent_id = agents.id;`);
    
  let str = '';
  for (let i = 0; i < rows.length; i++){
    str += `
    <div class = "imgs">
        <br>
        <p class = "right">Ultimo Real Estate</p>
        <br>
        <a target="_blank" href="./gallery?id=${rows[i].id}"><img src= images/${rows[i].image_path} alt="Home1" style="width:100%; height: 242px;"></a><br>
        <h5 class = "obi">${rows[i].name}<a href = "#"><img src = "images/${rows[i].agents_photo}" width = "70px;" height="70px;" style = "border-radius: 50%;"></a></h5>
        <br>
        <h4>${rows[i].address}</h4><br>
        <p class = "icons">
            <img src = "images/bed.png">${rows[i].bed}<img src = "images/shower.png">${rows[i].shower}<img src = "images/car.png">${rows[i].bed}</p>
        <p class = "inspe"><img src = "images/planner.png"> Inspection : ${rows[i].inspection}</p>
        <br>
    </diV>`
  }
  const withAgentsReplaced = data.replace(/@@@property@@@/g, str)
  let tokenPayload = logInCookieTokenPayload(req);

  if(tokenPayload && tokenPayload.role == 'agent'){
    loggedIn2(withAgentsReplaced, tokenPayload, res)
  }else{
    const withGreetingAndAgentsReplaced = withAgentsReplaced.replace(/@@@addForm@@@/g, '');
    finish(withGreetingAndAgentsReplaced, res);
  }
};


// Individual property pages
async function individualProperty(req, res){
  let idNumber = parseInt(req.query.id);
  let query = `SELECT * FROM property WHERE id = ${idNumber};`;
  let rows = await dbMysql.promisifiedQuery(query);
  let agentID = rows[0].agent_id;

  let agentQuery = `SELECT name, agents_photo   FROM  agents WHERE id = ${agentID}`;
  let agentRows = await dbMysql.promisifiedQuery(agentQuery);
  res.render('gallery.ejs', {
    address: rows[0].address,
    houseImage: rows[0].image_path,
    shower: rows[0].shower,
    bed: rows[0].bed,
    car: rows[0].car,
    inspection: rows[0].inspection,
    name: agentRows[0].name,
    agents_photo: agentRows[0].agents_photo
  });
  res.end();
}


// Add property feature
const addProperty =  async function(req, res){
  let address = req.body.address;
  let inspection = req.body.inspection;
  let image_path = req.body.image_path;
  let addName = req.body.agentName;
  let bed = req.body.bed;
  let shower = req.body.shower;
  let car = req.body.car;
  let number = parseInt(req.query.id);

  let rows = await dbMysql.promisifiedQuery(`SELECT * from agents WHERE name LIKE "${addName}%";`);
  let card = `
    <div class = "imgs">
      <br>
      <p class = "right">Ultimo Real Estate</p>
      <br>
      <a target="_blank" href="./properties/house${number}.html"><img src= images/${image_path} alt="Home1" style="width:100%; height: 242px;"></a><br>
      <h5 class = "obi">${rows[0].name}<a href = "#"><img src = "images/${rows[0].agents_photo}" width = "70px;" height="70px;" style = "border-radius: 50%;"></a></h5>
      <br>
      <h4>${address}</h4><br>
      <p class = "icons">
          <img src = "images/bed.png">${bed}<img src = "images/shower.png">${shower}<img src = "images/car.png">${car}</p>
      <p class = "inspe"><img src = "images/planner.png"> Inspection : ${inspection}</p>
      <br>
    </diV>`;
  await dbMysql.promisifiedQuery(`INSERT INTO property (agent_id, address, image_path, inspection, 
    bed, shower, car) 
    VALUES ('${rows[0].id}','${address}', '${image_path}', '${inspection}', ${bed}, ${shower}, ${car});`);
  res.send (card);  
  res.end();
}


// Export
module.exports.propertyMain = propertyMain;
module.exports.individualProperty = individualProperty;
module.exports.addProperty = addProperty;