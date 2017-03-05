var app = require('./config/custom-express')();

app.listen(3000, function(req, res){
	console.log('servidor rodando na porta 3000');
});
