var rl = require('readline').createInterface({
	terminal: false,
	input: require('fs').createReadStream('words')
});

var fs = require('fs');
var wordJSON = {Saves:[]};

rl.on('line', function (line) {
  wordJSON.Saves.push({Name:line});
});

rl.on('close', function() {
	fs.writeFile("./JSONDict", JSON.stringify(wordJSON), function(err) {
	if(err) {
		return console.log(err);
	}
	
	console.log("The file was saved!");
	});
	
});
