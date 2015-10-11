var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	fs = require('fs'),
	formidable = require('formidable'),
	mkdirp = require('mkdirp');

eval(fs.readFileSync('database.js')+'');
eval(fs.readFileSync('databaseSimple.js')+'');
eval(fs.readFileSync('search.js')+'');

app.post('/Save.api', function(req,res) {
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	var filePath = "";
	
	var form = new formidable.IncomingForm({
		uploadDir: __dirname + '/render'
	});
	form.parse(req, function(err, fields, file) { //Name: 'moo', Description: '', Publish: 'Private'
		var time = parseInt(new Date() / 1000);
		
		var publish = fields.Publish != "Private";
		
		addSave(userID, userKey, fields.Name, fields.Description, publish, time, function(data) {
			res.send("OK " + data.ID);
			version = data.Version
			filename = data.ID + '';
			
			renderSavePTI(filePath, time, filename, function() {
				fs.rename(filePath, __dirname + "/static/cps/" + filename + '.cps');
				saveVersion(filename, version);
			});
		});
	});
	
	form.on('file', function(field, file) {
		checkLastSaveID(function(data) {
			console.log(data + " is the current ID");
			filePath = file.path;
		});
	})
});

app.post('/Vote.api', function(req,res) {
	console.log(req.headers['x-auth-user-id']);
	console.log(req.headers['x-auth-session-key']);
	
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {		
		var voteDirection = fields.Action;
		var saveID = fields.ID;
		saveVote(userID, userKey, saveID, voteDirection, function(returnval) {
			console.log(returnval);
		});
		
	res.send("OK"); //send error message ex. "You can not vote for yourself!"
	});
});

app.post('/Browse/Comments.json', function(req,res) {
	var saveID = req.query.ID;
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		addComment(userID, userKey, fields.Comment, saveID, function(error) {
			if(!error)
				res.send('{"Status":1}');
			else
				res.send('{"Status":0, "Error":"' + error + '"}');
		});
	});
});

app.post('/Browse/Report.json', function(req,res) {
	var saveID = req.query.ID;
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		reportSave(userID, userKey, fields.Reason, saveID, function(data) {
			if(!data)
				res.send('{"Status":1}');
			else
				res.send('{"Status":0, "Error":"' + error + '"}');
		});
	});
});

app.get('/Browse/Favourite.json', function(req,res) {
	if(req.query.Mode == 'Remove')
	{
		removeFavourite(req.query.ID, req.query.Key, function(data) {
			if(!data)
				res.send('{"Status":1}');
			else
				res.send('{"Status":0, "Error":"' + error + '"}');
		});
	} else {
		addFavourite(req.query.ID, req.query.Key, function(data) {
			if(!data)
				res.send('{"Status":1}');
			else
				res.send('{"Status":0, "Error":"' + error + '"}');
		});
	}
});

app.get('/Browse.json', function(req,res) {
	console.log(req.query);
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
	if(req.query.Search_Query != '')
	{
		if(req.query.Category !== undefined)
		{
			if(req.query.Category == "Favourites")
			{
				console.log('Searching by Favourite');
				buildFavouriteSearch(userID, userKey, req.query.Start, req.query.Count, req.query.Search_Query, function(data) {
					res.send(data);
				});
			}
			else
			{
				console.log('Searching by Category');
				res.send('{"Count":1,"Saves":[{"ID":2,"Created":1442514001,"Updated":1442514001,"Version":0,"Score":17,"ScoreUp":18,"ScoreDown":1,"Name":"Ping Pong Game","ShortName":"Ping Pong Game","Username":"the-good-side","Comments":8,"Published":false}]}');
			}
		} else {
			console.log('Searching');
			res.send('{"Count":1,"Saves":[{"ID":2,"Created":1442514001,"Updated":1442514001,"Version":0,"Score":17,"ScoreUp":18,"ScoreDown":1,"Name":"Ping Pong Game","ShortName":"Ping Pong Game","Username":"the-good-side","Comments":8,"Published":false}]}');
		}
	} else if(req.query.Category !== undefined) {
		if(req.query.Category == "Favourites")
		{
			console.log("Favourite");
			
			buildFavourite(userID, userKey, req.query.Start, req.query.Count, function(data) {
				res.send(data);
			});
		}
		else
		{
			console.log('Category');
			if(req.query.Category.substr(0,3) == 'by:')
				buildByOwn(userID, userKey, req.query.Start, req.query.Count, function(data) {
					res.send(data);
				});
			else
				res.send('{"Count":1,"Saves":[{"ID":2,"Created":1442514001,"Updated":1442514001,"Version":0,"Score":17,"ScoreUp":18,"ScoreDown":1,"Name":"Ping Pong Game","ShortName":"Ping Pong Game","Username":"the-good-side","Comments":8,"Published":false}]}');
		}
	} else {
		if(req.query.Start == '0')
		{
			console.log("Building FP");
			buildSecondPage(req.query.Start, req.query.Count, function(data) {
				res.send(data);
			});
		}
		else
		{
			console.log("Building Most Votes");
			buildSecondPage(req.query.Start, req.query.Count, function(data) {
				res.send(data);
			});
		}
	}
});

app.get('/Browse/View.json', function(req,res) {
	console.log('Browse.json/View.json');
	
	var userID = req.headers['x-auth-user-id'];
	var userKey = req.headers['x-auth-session-key'];
	
  	getSaveInfo(req.query.ID, function(data) {
		if(data != -1)
		{
			if(userKey !== undefined)
			{
				getVote(userID, req.query.ID, function(voteDirection) {
					data.ScoreMine = voteDirection;
					//
					getFavourite(userID, req.query.ID, function(isFavourite) {
						if(isFavourite)
							data.Favourite = true;
						
						res.send(data);
					});
				});
			} else {
				res.send(data);
			}
		} else {
			res.send('{"Status":0,"Error":"Could not load save."}');
		}
	});
});

app.get('/Browse/Comments.json', function(req,res) {
	console.log(req.query);
	console.log('/Browse/Comments.json');
	getComments(req.query.ID, req.query.Start, req.query.Count, function(saves) {
		res.send(saves);
	})
});

app.get('/Browse/EditTag.json', function(req,res) {
	console.log(req.query);
	console.log('/Browse/EditTag.json');
	
	if(req.query.Op ==  'add')
		addTag(req.query.ID, req.query.Tag, req.query.Key, function(data) {
			if(data !== undefined)
				res.send('{"Status":0, "Error":' + data + '}');
			else
			{
				var toSend = {};
				toSend.Status = 1;
				getTags(req.query.ID, function(data) {
					toSend.Tags = data;
					res.send(toSend);
				});
			}
		});
	else if(req.query.Op ==  'delete')
		removeTag(req.query.ID, req.query.Tag, req.query.Key, function(data) {
			if(data !== undefined)
				res.send('{"Status":0, "Error":' + data + '}');
			else
			{
				var toSend = {};
				toSend.Status = 1;
				getTags(req.query.ID, function(data) {
					toSend.Tags = data;
					res.send(toSend);
				});
			}
		});
});
app.get('/Browse/Delete.json', function(req,res) {
  console.log(req.query);
  console.log('/Browse/Delete.json');
  res.end();
});

app.get('/Startup.json', function(req,res) {
  console.log(req.headers);
  console.log('/Startup.json');
  res.send('{"Updates":{"Stable":{"Major":90,"Minor":2,"Build":322,"File":"\/Download\/Builds\/Build-322\/-.ptu"},"Beta":{"Major":90,"Minor":1,"Build":320,"File":"\/Download\/Builds\/Build-320\/-.ptu"},"Snapshot":{"Major":83,"Minor":3,"Build":208,"Snapshot":1346881831,"File":"\/Download\/Builds\/TPTPP\/-.ptu"}},"Notifications":[],"Session":true,"MessageOfTheDay":"TPT has a lot of mods. \bt{a:http:\/\/powdertoy.co.uk\/Discussions\/Categories\/Topics.html?Category=9|Check here.}"} ');
});

app.post('/Profile.json', function(req,res) {
	var userID = req.headers['x-auth-user-id'];
	var userKey =  req.headers['x-auth-session-key'];
	
  	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		setProfile(userID, userKey, fields);
		res.send('{"Status":1}');
	});
  console.log('/Profile.json');
});

app.get('/User.json', function(req,res) {
	console.log(req.query);
	var username = req.query.Name;
	console.log('/User.json');
	
	getUser(username, function(data) {
		res.send(data);
	});
});

app.post('/Login.json', function(req,res) {
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

app.get('/Browse/Tags', function(req,res) {
	res.end();
});

app.use(function (req, res) {
	if(req.originalUrl.substr(req.originalUrl.lastIndexOf('.')) == '.pti')
	{
		res.sendFile(__dirname + '/static/pti/saves' + req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')) + '.pti');
	} else {
		res.sendFile(__dirname + '/static/cps' + req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')) + '.cps');
		console.log(__dirname + '/static/cps' + req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')) + '.cps');
	}
});

http.listen(3000, function(){
	console.log('listening on *:3000');
	process.chdir(__dirname + "/render");
});
