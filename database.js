var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/tpt';

function checkUser(userName, userHash, _callback)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({"Hash":userHash}).toArray(function(err, docs){
				if(docs.length > 0 && docs[0].Name == userName)
					_callback(true);
				else
					_callback(false);

				db.close();
			});
		}
	});
}

function getUser(userName, _callback)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({"Name":userName}).toArray(function(err, docs){
				if(docs.length > 0)
				{
					var toReturn = {User:{}}
					
					for (name in docs[0]) {
						if (docs[0].hasOwnProperty(name)) {
							if(name == 'Name')
								toReturn.User.Username = userName;
							else if(name != '_id' && name != 'Hash' && name != 'sessionID')
								toReturn.User[name] = docs[0][name];
								
						}
					}
					
					_callback(JSON.stringify(toReturn));
				}
				else
					_callback('{"User":{"Username":"NULL","ID":0}}');

				db.close();
			});
		}
	});
}

function generateHash()
{
	var hash = "";
	for(var x = 0; x <= 9; x++)
	{
		currentChar = Math.floor(Math.random() * 36);
		if(currentChar > 9)
		{
			hash += String.fromCharCode(currentChar + 55);
		} else {
			hash += currentChar;
		}
		
		if(x == 9)
			return hash;
	}
}

function IDtoName(userID, _callback)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({"ID":parseInt(userID)}).toArray(function(err, docs){
				db.close();
				_callback(docs[0].Name);
			});
		}
	});
}

function setProfileDatabase(userName, info)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.update({"Name":userName}, {$set: {"Biography":info.Biography, "Location":info.Location}});
			db.close();
		}
	});
}

function setProfile(userID, userKey, info)
{
	IDtoName(userID, function(userName){
		getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				setProfileDatabase(userName, info);
				return true;
			}
			else
			{
				console.log("Invalid login from " + userName);
				return false;
			}
		});
	});
}

function setSession(userName, hash)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.update({"Name":userName}, {$set: {"SessionID":hash}});
			db.close();
		}
	});
}

function getSession(userName, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({"Name":userName}).toArray(function(err, docs){
				db.close();
				callback_(docs[0].SessionID);
			});
		}
	});
}

function login(userName, callback_)
{
	console.log(userName + " logged in");
	
	setSession(userName, generateHash());
	
	getSession(userName, function(data) {
		getUser(userName, function(userdata) {
			callback_('{"Status":1,"UserID":' + JSON.parse(userdata).User.ID + ',"SessionID":"' + data + '","SessionKey":"POTATOPOTATOPOTATO"}'); //{"Status":1,"UserID":47804,"SessionID":"A12B4CFVTTBTBT4NVI84598G58G958","SessionKey":"DB12346736","Elevation":"None","Notifications":[]}
		});
	});
}
