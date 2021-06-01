const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shoko12180315',
  database: 'expressproject'
});

connection.connect();

const promisifiedQuery = function(sql, args){
  return util.promisify(connection.query).call(connection, sql, args);
};

module.exports.connection = connection;
module.exports.promisifiedQuery = promisifiedQuery;


