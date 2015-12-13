var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	url = 'mongodb://localhost:27017/tpt';

var rimraf = require('rimraf');

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
				LastSaveID: 0,
				LastUserID: 0
			}, function() {
				db.close();
			});
		});
	}
});
