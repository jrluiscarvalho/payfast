var mysql = require('mysql');

function createDBConnection() {
	return mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123',
		database: 'payfast'
	});
}

module.exports = function(){
	return createDBConnection;
}