const mysql = require('mysql2');

// MySQL
const db = mysql.createPool({
    host: 'localhost',  // MySQL host
    user: 'root',       // MySQL username
    password: '799eb8e39b0ae16d', // MySQL password
    database: 'blog',    // Database name
    port: 3306
});

module.exports = db;