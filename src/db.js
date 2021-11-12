const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  charset: "utf8mb4",
});

connection.connect((err) => {
  if (!err) {
    console.log("connection established");
  }
});

module.exports = connection;
