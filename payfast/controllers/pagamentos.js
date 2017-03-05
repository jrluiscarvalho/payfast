module.exports = function(app){

	app.get('/pagamentos', function(req, res){
		var connection = app.persistencia.connectionFactory();
		var pagamentoDao = new app.persistencia.PagamentoDao(connection);
		pagamentoDao.lista(function(erro, result){
			if(erro){
				console.log("deu erro", erro);
			}else{
				res.status(200).send(result);
			}

		});
	});

	app.post('/pagamentos/pagamento', function(req, res){
		var pagamento = req.body.pagamento;

		req.assert("pagamento.forma_de_pagamento", "Forma de Pagamento é Obrigatoria").notEmpty();
		req.assert("pagamento.valor", "Valor é obrigatorio e deve ser decimal").notEmpty().isFloat();
		req.assert("pagamento.moeda", "Moeda é obrigatoria e deve ter 3 caracteres").notEmpty().len(3,3);

		var errors = req.validationErrors();

		var connection = app.persistencia.connectionFactory();
		var pagamentoDao = new app.persistencia.PagamentoDao(connection);

		pagamento.status = "CRIADO";
		pagamento.data = new Date;

		pagamentoDao.salva(pagamento, function(erro, result){
			if(erro){
				console.log("Erros de validação encontrados"+erro);
				res.status(500).send(erro);
			}else{
				console.log("pagamento criado");

				if(pagamento.forma_de_pagamento == 'cartao'){
					var cartao = req.body["cartao"];
					console.log(cartao);
					pagamentoComCartao(cartao, result, pagamento, res);

				}					
			}
		});
	});

app.put('/pagamentos/pagamento/:id', function(req, res){
	var pagamento = {};
	var id = req.params.id;

	pagamento.id = id;
	pagamento.status = "CONFIRMADO";

	var connection = app.persistencia.connectionFactory();
	var pagamentoDao = new app.persistencia.PagamentoDao(connection);

	pagamentoDao.atualiza(pagamento, function(erro){
		if(erro){
			res.status(500).send(erro);
			return;
		}
		console.log("pagamento criado");
		res.send(pagamento);
	});
});

app.delete('/pagamentos/pagamento/:id', function(req, res){
	var pagamento = {};
	var id = req.params.id;

	pagamento.id = id;
	pagamento.status = "CANCELADO";

	var connection = app.persistencia.connectionFactory();
	var pagamentoDao = new app.persistencia.PagamentoDao(connection);

	pagamentoDao.atualiza(pagamento, function(erro){
		if(erro){
			res.status(500).send(erro);
			return;
		}
		console.log("pagamento cancelado");
		res.status(204).send(pagamento);
	});
});



function pagamentoComCartao(cartao, result, pagamento, res){
	var clienteCartoes = new app.servicos.clienteCartoes();
	clienteCartoes.autoriza(cartao, function(exception, request, response, retorno){
		if(exception){
			console.log(exception);	
			res.status(400).send(exception);
			return;
		}
		console.log(retorno);
		


		res.location('/pagamentos/pagamento/' + result.insertId);

		var response = {
			dados_do_pagamento: pagamento,
			cartao: retorno,
			links: [
			{
				href:"http://localhost:3000/pagamentos/pagamento/"
				+ pagamento.id,
				rel: "confirmar",
				method:"PUT"
			},
			{
				href:"http://localhost:3000/pagamentos/pagamento/"
				+ pagamento.id,
				rel: "confirmar",
				method:"DELETE"
			}
			]
		}

		res.status(201).json(response);

	});					
}

};


