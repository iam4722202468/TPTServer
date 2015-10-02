var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	fs = require('fs'),
	formidable = require('formidable'),
	mkdirp = require('mkdirp');

eval(fs.readFileSync('database.js')+'');
eval(fs.readFileSync('databaseSimple.js')+'');

app.post('/Save.api',function(req,res){
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	var filePath = "";
	
	var form = new formidable.IncomingForm({
		uploadDir: __dirname + '/static' //where you want saves to be uploaded
	});
	form.parse(req, function(err, fields, file) { //Name: 'moo', Description: '', Publish: 'Private'
		addSave(userID, userKey, fields.Name, fields.Description, fields.Publish, function(data) {
			res.send("OK " + data.ID);
			version = data.Version
			filename = data.ID + '';
			fs.rename(filePath, form.uploadDir + "/" + filename + '.cps');
			saveVersion(filename, version);
		});
	});
	
	form.on('file', function(field, file) {
		checkLastSaveID(function(data) {
			console.log(data + " is the current ID");
			filePath = file.path;
		});
	})
});

app.post('/Vote.api',function(req,res){
	console.log(req.headers['x-auth-user-id']);
	console.log(req.headers['x-auth-session-key']);
	
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		console.log(fields.ID);
		console.log(fields.Action);
	res.send("OK"); //send error message ex. "You can not vote for yourself!"
	});
});

app.post('/Browse/Comments.json',function(req,res){
	var saveID = req.query.ID;
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		addComment(userID, userKey, fields.Comment, saveID, function(error) {
			if(!error)
			{
				res.send('{"Status":1}');
			} else {
				res.send('{"Status":0, "Error":"' + error + '"}');
			}
		});
	});
});

app.get('/Browse.json',function(req,res){
	console.log(req.query);
	console.log('Browse.json');
	res.send('{"Count":100,"Saves":[{"ID":2,"Created":1442514001,"Updated":1442514001,"Version":0,"Score":17,"ScoreUp":18,"ScoreDown":1,"Name":"Ping Pong Game","ShortName":"Ping Pong Game","Username":"the-good-side","Comments":8,"Published":true},{"ID":1852313,"Created":1441942469,"Updated":1442082925,"Version":0,"Score":159,"ScoreUp":192,"ScoreDown":33,"Name":"cow pooping","ShortName":"cow pooping","Username":"slug14","Comments":128,"Published":true},{"ID":1854835,"Created":1442344200,"Updated":1442344270,"Version":0,"Score":42,"ScoreUp":49,"ScoreDown":7,"Name":"MAGIC HAND OF MAGICNESS","ShortName":"MAGIC HAND OF MAGICNE...","Username":"MG99","Comments":18,"Published":true},{"ID":1855832,"Created":1442533936,"Updated":1442533964,"Version":0,"Score":2,"ScoreUp":2,"ScoreDown":0,"Name":"semi mini laser","ShortName":"semi mini laser","Username":"powderswagg","Comments":0,"Published":true},{"ID":1855353,"Created":1442442517,"Updated":1442442517,"Version":0,"Score":19,"ScoreUp":20,"ScoreDown":1,"Name":"Brain evolution","ShortName":"Brain evolution","Username":"Karakanlud","Comments":11,"Published":true},{"ID":1854794,"Created":1442338796,"Updated":1442502064,"Version":0,"Score":26,"ScoreUp":28,"ScoreDown":2,"Name":"16x4 LCD Text Display","ShortName":"16x4 LCD Text Display","Username":"jBot-42","Comments":18,"Published":true},{"ID":1852856,"Created":1442032369,"Updated":1442103893,"Version":0,"Score":37,"ScoreUp":42,"ScoreDown":5,"Name":"Spinal disc herniation - Nerve path","ShortName":"Spinal disc herniatio...","Username":"MG99","Comments":28,"Published":true},{"ID":1852348,"Created":1441956202,"Updated":1442391136,"Version":0,"Score":32,"ScoreUp":36,"ScoreDown":4,"Name":"Jumo 004 jet engine","ShortName":"Jumo 004 jet engine","Username":"Bristrees","Comments":33,"Published":true},{"ID":1855361,"Created":1442443772,"Updated":1442443772,"Version":0,"Score":11,"ScoreUp":15,"ScoreDown":4,"Name":"Dublof Shipping Station","ShortName":"Dublof Shipping Stati...","Username":"Karvia","Comments":10,"Published":true},{"ID":1853335,"Created":1442088370,"Updated":1442446485,"Version":0,"Score":24,"ScoreUp":29,"ScoreDown":5,"Name":"Falling Blocks Video Game","ShortName":"Falling Blocks Video ...","Username":"msasterisk","Comments":41,"Published":true},{"ID":1854711,"Created":1442327826,"Updated":1442395606,"Version":0,"Score":16,"ScoreUp":24,"ScoreDown":8,"Name":"Electronic Deactivator","ShortName":"Electronic Deactivato...","Username":"powderisfalling","Comments":19,"Published":true},{"ID":1854855,"Created":1442347789,"Updated":1442347789,"Version":0,"Score":15,"ScoreUp":18,"ScoreDown":3,"Name":"beam of doom in color","ShortName":"beam of doom in color","Username":"felix1297","Comments":7,"Published":true},{"ID":1853214,"Created":1442078152,"Updated":1442341512,"Version":0,"Score":23,"ScoreUp":32,"ScoreDown":9,"Name":"High Throughput DEUT Factory","ShortName":"High Throughput DEUT ...","Username":"Catelite","Comments":10,"Published":true},{"ID":1854336,"Created":1442252298,"Updated":1442326282,"Version":0,"Score":17,"ScoreUp":19,"ScoreDown":2,"Name":"UNSC Home Fleet","ShortName":"UNSC Home Fleet","Username":"Thelastspartan","Comments":16,"Published":true},{"ID":1853197,"Created":1442076985,"Updated":1442423469,"Version":0,"Score":18,"ScoreUp":20,"ScoreDown":2,"Name":"60HZ Randomizer","ShortName":"60HZ Randomizer","Username":"Elite01","Comments":13,"Published":true},{"ID":1854353,"Created":1442254252,"Updated":1442442842,"Version":0,"Score":12,"ScoreUp":13,"ScoreDown":1,"Name":"My Compact Brain","ShortName":"My Compact Brain","Username":"Karakanlud","Comments":6,"Published":true},{"ID":1855821,"Created":1442531198,"Updated":1442531286,"Version":0,"Score":2,"ScoreUp":2,"ScoreDown":0,"Name":"Smallest SING cannon","ShortName":"Smallest SING cannon","Username":"gbasilva","Comments":0,"Published":true},{"ID":1853937,"Created":1442174212,"Updated":1442328774,"Version":0,"Score":8,"ScoreUp":13,"ScoreDown":5,"Name":"Read Only Memory","ShortName":"Read Only Memory","Username":"jBot-42","Comments":29,"Published":true},{"ID":1854969,"Created":1442375050,"Updated":1442441346,"Version":0,"Score":5,"ScoreUp":5,"ScoreDown":0,"Name":"Trying to convince the update.","ShortName":"Trying to convince th...","Username":"Voyager15","Comments":1,"Published":true},{"ID":1854892,"Created":1442353082,"Updated":1442533573,"Version":0,"Score":5,"ScoreUp":6,"ScoreDown":1,"Name":"Praesidium","ShortName":"Praesidium","Username":"RCAProduction","Comments":1,"Published":true},{"ID":1855589,"Created":1442499020,"Updated":1442499020,"Version":0,"Score":3,"ScoreUp":4,"ScoreDown":1,"Name":"Holographic City copy (destract)","ShortName":"Holographic City copy...","Username":"mrdefolk","Comments":1,"Published":true},{"ID":1855782,"Created":1442524671,"Updated":1442525101,"Version":0,"Score":2,"ScoreUp":2,"ScoreDown":0,"Name":"Tiger 4 vs Soviet prototype tank","ShortName":"Tiger 4 vs Soviet pro...","Username":"benry2000","Comments":0,"Published":true},{"ID":1853244,"Created":1442081002,"Updated":1442228028,"Version":0,"Score":5,"ScoreUp":5,"ScoreDown":0,"Name":"1\/10 Warframe Eclipse-Class","ShortName":"1\/10 Warframe Eclipse...","Username":"Megamenx99","Comments":6,"Published":true},{"ID":1852460,"Created":1441977343,"Updated":1442151391,"Version":0,"Score":5,"ScoreUp":5,"ScoreDown":0,"Name":"1\/10 Collapse-Class Advanced Titan","ShortName":"1\/10 Collapse-Class A...","Username":"Megamenx99","Comments":3,"Published":true}]}');
});
app.get('/Browse/View.json',function(req,res){
	console.log('Browse.json/View.json');
  	getSaveInfo(req.query.ID, function(data) {
		res.send(data);
		console.log(data);
	});
	//res.send('{"ID":2,"Favourite":false,"Score":102,"ScoreUp":178,"ScoreDown":76,"Views":28781,"ShortName":"LOGIC","Name":"LOGIC","Description":"No description provided.","DateCreated":0,"Date":1353731824,"Username":"marbdy","Comments":692,"Published":false,"Version":0,"Tags":["firstsave","coolness","postlogicgates","stickynote9","whatisnull","null","firstwoo","savenulllow","itscool","city"],"ScoreMine":0}');
});

app.get('/Browse/Comments.json',function(req,res){
	console.log(req.query);
	console.log('/Browse/Comments.json');
	getComments(req.query.ID, req.query.Start, req.query.Count, function(saves) {
		res.send(saves);
	})
});
app.get('/Browse/Tags.json',function(req,res){
  console.log(req.query);
  console.log('/Browse/Tags.json');
  res.end();
});
app.get('/Browse/EditTag.json',function(req,res){
  console.log(req.query);
  console.log('/Browse/EditTag.json');
  res.end();
});
app.get('/Browse/Delete.json',function(req,res){
  console.log(req.query);
  console.log('/Browse/Delete.json');
  res.end();
});

app.get('/Startup.json',function(req,res){
  console.log(req.headers);
  console.log('/Startup.json');
  res.send('{"Updates":{"Stable":{"Major":90,"Minor":2,"Build":322,"File":"\/Download\/Builds\/Build-322\/-.ptu"},"Beta":{"Major":90,"Minor":1,"Build":320,"File":"\/Download\/Builds\/Build-320\/-.ptu"},"Snapshot":{"Major":83,"Minor":3,"Build":208,"Snapshot":1346881831,"File":"\/Download\/Builds\/TPTPP\/-.ptu"}},"Notifications":[],"Session":true,"MessageOfTheDay":"TPT has a lot of mods. \bt{a:http:\/\/powdertoy.co.uk\/Discussions\/Categories\/Topics.html?Category=9|Check here.}"} ');
});

app.post('/Profile.json',function(req,res){
	var userID = req.headers['x-auth-user-id'];
	var userKey =  req.headers['x-auth-session-key'];
	
  	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		setProfile(userID, userKey, fields);
		res.send('{"Status":1}');
	});
  console.log('/Profile.json');
});
app.get('/User.json',function(req,res){
	console.log(req.query);
	username = req.query.Name;
	console.log('/User.json');
	
	getUser(username, function(data) {
		res.send(data);
	});
});

app.post('/Login.json',function(req,res){
  	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {

		checkUser(fields.Username, fields.Hash, function(data) {
			if(data)
			{
				login(fields.Username, function(senddata){
					res.send(senddata);
				});
			}
			else
				res.send('{"Status":0,"Error":"Username or Password incorrect."}');
		});
	});
	console.log('login');
});

http.listen(3000, function(){
	console.log('listening on *:3000');
	app.use(express.static(__dirname + '/static'));
});
