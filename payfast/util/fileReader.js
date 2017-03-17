var fs = require('fs');

fs.readFile('imagem.jpg', function(){
    fs.writeFile('imagem2.jpg')
})