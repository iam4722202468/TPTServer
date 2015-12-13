var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	url = 'mongodb://localhost:27017/tpt';

var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

MongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
		db.dropDatabase(function(err, result) {
			if(err)
				console.log(err);
			else
				console.log("Database dropped");
			
			var collection = db.collection('Info');
			
			collection.insert({
				LastSaveID: 1,
				LastUserID: 0
			}, function() {
				db.close();
			});
			
			try {
				rimraf(__dirname + "/static/pti/", function(){});
				rimraf(__dirname + "/static/cps/", function(){});
				rimraf(__dirname + "/static/png/", function(){});
				rimraf(__dirname + "/static/deleted/", function(){});
			} catch(e) {
				console.log(e)
			}
			
			mkdirp(__dirname + "/static/pti/", function(err) {
				if(err)
					console.log(err)
				else {
					console.log("Created pti folder");
					
					mkdirp(__dirname + "/static/pti/saves", function(err) { 
						if(err)
							console.log(err)
						else
							console.log("Created pti save folder");
					});
				}
			});
			
			mkdirp(__dirname + "/static/cps/", function(err) { 
				if(err)
					console.log(err)
				else
					console.log("Created cps folder");
			});
			
			mkdirp(__dirname + "/static/png/", function(err) { 
				if(err)
					console.log(err)
				else
					console.log("Created png folder");
			});
			
			mkdirp(__dirname + "/tmp/", function(err) { 
				if(err)
					console.log(err)
				else
					console.log("Created tmp folder");
			});
			
			mkdirp(__dirname + "/static/deleted/", function(err) { 
				if(err)
					console.log(err)
				else
					console.log("Created deleted folder");
			});
		});
	}
});
