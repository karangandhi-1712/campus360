const mysql = require("mysql2");
const db = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Root@1234",
    database:"campus360"
});
module.exports = db;