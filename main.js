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
			if(data.length < 2)
				res.send(data);
			else
				res.send("OK " + data.ID);
			version = data.Version
			filename = data.ID + '';
			
			renderSavePTI(filePath, version, filename, function() {
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
			if(data !== undefined)
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
	
	if(req.query.Search_Query === undefined)
		req.query.Search_Query = '';
	
	var query = req.query.Search_Query;
	var searchByUser = false;
	
	if(query.substr(0,8) == "history:" && query.split(" ")[query.split(" ").length-1].split(":").length == 2 && query.split(" ")[query.split(" ").length-1].split(":")[1] != "")
	{
		buildByHistory(parseInt(query.split(" ")[0].split(":")[1]), req.query.Start, req.query.Count, function(data) {
			res.send(data);
		})
	}
	else if(query.substr(0,3) == "id:" && query.split(" ")[query.split(" ").length-1].split(":").length == 2 && query.split(" ")[query.split(" ").length-1].split(":")[1] != "")
	{
		var saveID = {};
		saveID['ID'] = parseInt(query.split(" ")[0].split(":")[1]);
		
		getDBInfo('Saves', saveID, function(data) {
			if(data.length > 0)
			{
				data[0].Version = 0;
				delete data[0]['_id'];
				res.send({'Count':1, 'Saves':data});
			} else
				res.send({"Status":0,"Error":"No save found with that ID"});
		});
	}
	else if((query.substr(0, 5) == "user:" || (query.split(" ").length >= 1 && query.split(" ")[query.split(" ").length-1].split(":")[0] == "user" && query.split(" ")[query.split(" ").length-1].split(":").length == 2 && query.split(" ")[query.split(" ").length-1].split(":")[1] != "")) || (query.split(" ").length >= 2 && query.split(" ")[query.split(" ").length-2].split(":")[0] == "user" && query.split(" ")[query.split(" ").length-2].split(":").length == 2 && query.split(" ")[query.split(" ").length-2].split(":")[1] != ""))
	{
		var userName = "";
		
		if(query.split(" ")[query.split(" ").length-1].split(":")[0] == "user")
		{
			userName = query.split(" ")[query.split(" ").length-1].split(":")[1];
			query = query.split(" ").splice(0, query.split(" ").length-1).join(" ");
		} else {
			userName = query.split(" ")[query.split(" ").length-2].split(":")[1];
			if(query.split(" ").splice(0, query.split(" ").length-2).join(" ").length > 0)
				query = query.split(" ").splice(0, query.split(" ").length-2).join(" ") + " " + query.split(" ")[query.split(" ").length-1];
			else
				query = query.split(" ")[query.split(" ").length-1];
			
		}
		buildByUser(userName, function(data) {
			searchAndSort(req.query.Start, req.query.Count, data.Saves, query, function(returnJSON) {
				res.send(returnJSON);
			});
		});
	}
	else if(req.query.Category !== undefined)
	{
		if(req.query.Category == "Favourites")
		{
			//console.log('Searching by Favourite');
			buildByFavourite(userID, userKey, function(data) {
				if(data.Saves.length == 0)
					res.send({"Status":0,"Error":"No saves found"});
				else
					searchAndSort(req.query.Start, req.query.Count, data.Saves, req.query.Search_Query, function(returnJSON) {
						res.send(returnJSON);
					});
			});
		}
		else
		{
			//console.log('Searching by Own');
			buildByOwn(userID, userKey, function(data) {
				searchAndSort(req.query.Start, req.query.Count, data.Saves, req.query.Search_Query, function(returnJSON) {
					res.send(returnJSON);
				});
			});
		}
	} else if(req.query.Start == '0') {
		//console.log("Building FP");
		buildFP(req.query.Start, req.query.Count, function(data) {
			res.send(data);
		});
	} else {
		if(req.query.Search_Query == '') {
			buildBySort('Score', req.query.Start, req.query.Count, function(data) {
				res.send(data);
			});
		} else {
			buildByAllSearch(req.query.Start, req.query.Count, req.query.Search_Query, function(data) {
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
				res.send('{"Status":0,"Error":"' + data + '"}');
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
				res.send('{"Status":0, "Error":"' + data + '"}');
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
	console.log('/Browse/Delete.json');
	console.log(req.query);
	
	if(req.query.Mode == 'Unpublish')
	{
		setPublish(req.query.ID, req.query.Key, false, function(data) {
			if(data !== undefined)
				res.send('{"Status":0,"Error":"' + data + '"}');
			else
				res.send('{"Status":1}');
		});
	}
	else if(req.query.Mode == 'Delete')
	{
		deleteSave(req.query.ID, req.query.Key, function(data) {
			if(data !== undefined)
				res.send('{"Status":0,"Error":"' + data + '"}');
			else
				res.send('{"Status":1}')
		});
	}
});

app.get('/Startup.json', function(req,res) {
  console.log(req.headers);
  console.log('/Startup.json');
  res.send('{"Updates":{"Stable":{"Major":90,"Minor":2,"Build":322,"File":"\/Download\/Builds\/Build-322\/-.ptu"},"Beta":{"Major":90,"Minor":1,"Build":320,"File":"\/Download\/Builds\/Build-320\/-.ptu"},"Snapshot":{"Major":83,"Minor":3,"Build":208,"Snapshot":1346881831,"File":"\/Download\/Builds\/TPTPP\/-.ptu"}},"Notifications":[],"Session":true,"MessageOfTheDay":"Iam\'s beta tpt server. \bt{a:http:\/\/iam.starcatcher.us\/iam\/tptserver|Source here.}"} ');
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
	
	if(req.originalUrl.indexOf('/Browse/View.html') >= 0)
	{
		console.log(req.query);
		setPublish(req.query.ID, req.query.Key, true, function(data) {
			if(data !== undefined)
				res.send('{"Status":0,"Error":"' + data + '"}');
			else
				res.send('OK');
		});
	}
	else if(req.originalUrl.substr(req.originalUrl.lastIndexOf('.')) == '.pti')
	{
		var urlParts = req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')).split("_");
		
		if(urlParts.length == 2 && urlParts[1] != 'small')
		{
			var saveID = urlParts[0].split("/")[1];
			res.sendFile(__dirname + '/static/pti/saves/' + saveID + '/' + saveID + '_' + parseInt(urlParts[1]-1) + '.pti');
		}
		else if(urlParts.length == 3)
		{
			var saveID = urlParts[0].split("/")[1];
			res.sendFile(__dirname + '/static/pti/saves/' + saveID + '/' + saveID + '_' + parseInt(urlParts[1]-1) + '_small.pti');
		}
		else
			res.sendFile(__dirname + '/static/pti/saves' + req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')) + '.pti');
	} else {
		if(req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')).split("_").length >= 2) {
			
			var saveID = req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')).split("_")[0];
			var saveVersion = req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')).split("_")[1];
			res.sendFile(__dirname + '/static/cps/' + saveID + '/' + saveID + "_" + parseInt(saveVersion-1) + '.cps');
		
		} else {
			res.sendFile(__dirname + '/static/cps' + req.originalUrl.substr(0, req.originalUrl.lastIndexOf('.')) + '.cps');
		}
	}
});

http.listen(3100, function(){
	console.log('listening on *:3100');
	process.chdir(__dirname + "/render");
});
