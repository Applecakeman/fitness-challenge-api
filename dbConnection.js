const mysql = require('mysql2');
const config = require('config');

const connection = mysql.createConnection({
    host: config.get('dbConfig.host'),
    port: '3306',
    user: config.get('dbConfig.user'),
    password: config.get('dbConfig.password'),
    database: config.get('dbConfig.database')
});

module.exports = connection;
