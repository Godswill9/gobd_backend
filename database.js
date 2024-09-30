const mySql = require("mysql2");

const connectDB = mySql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true, 
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
});

connectDB.connect(function (err) {
  if (err) throw err;

  console.log("Connected!");
});

module.exports = connectDB;