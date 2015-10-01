var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/tpt';

function saveVersion(saveID, version)
{
	mkdirp('./static/'+saveID, function(err) { 
		fs.createReadStream('./static/'+saveID+'.cps').pipe(fs.createWriteStream('./static/'+saveID+'/'+saveID+'_'+version+'.cps'));
	});
}

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

function checkIfSaveExists(userName, saveName, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Saves');	
			
			collection.find({$and:[{'Username':userName},{'Name':saveName}]}).toArray(function(err, docs){
				if(docs.length > 0)
				{
					db.close();
					callback_(docs[0].ID);
				}
				else
				{
					db.close();
					callback_(-1);
				}
			});
		}
	});
}

function checkLastSaveID(callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Info');	
			
			collection.find().toArray(function(err, docs){
				var lastUser = docs[0].LastUserID;
				var lastSave = docs[0].LastSaveID;
				
				db.close();
				callback_(lastSave);
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
			collection.find({"ID":parseInt(userID)}).toArray(function(err, docs) {
				db.close();
				_callback(docs[0].Name);
			});
		}
	});
}

function getSaveVersion(saveID, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Saves');
			collection.find({"ID":saveID}).toArray(function(err, docs){
				db.close();
				callback_(docs[0].Version);
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

function addSave(userID, userKey, saveName, saveDescription, savePublish, callback_)
{
	IDtoName(userID, function(userName){
		getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				MongoClient.connect(url, function (err, db) {
					if (err) {
						console.log('Unable to connect to the mongoDB server. Error:', err);
					} else {
						console.log('Connection established to', url);

						var collection = db.collection('Info');
						
						collection.find().toArray(function(err, docs){
							var lastUser = docs[0].LastUserID;
							var lastSave = docs[0].LastSaveID;
							
							checkIfSaveExists(userName, saveName, function(newSaveID) {
								if(newSaveID < 0)
								{
									collection.update({'LastUserID':lastUser}, {$set: {'LastSaveID':lastSave+1}});
									db.collection("Saves", function(error, collection){
										collection.insert({
											ID: lastSave,
											Created: Date.now(),
											Updated: Date.now(),
											Version: 0,
											Score: 1,
											ScoreUp: 1,
											ScoreDown: 0,
											Name: saveName,
											ShortName: saveName,
											Username: userName
										}, function() {
											console.log("Successfully inserted with ID " + lastSave);
											callback_({'ID':lastSave, 'Version':0});
										});
									});
									db.close();
								}
								else
								{
									collection = db.collection('Saves');
									
									console.log("Save " + newSaveID + " already in database")
									
									getSaveVersion(newSaveID, function(lastVersion) {
										collection.update({"ID" : newSaveID}, {$set: {'Version':lastVersion+1}});
										console.log("The last version is " + parseInt(lastVersion+1));
										callback_({'ID':newSaveID, 'Version':lastVersion+1});
									});
								}
							});
						});
					}
				});
			}
			else
			{
				console.log("Invalid login from " + userName);
				return false;
			}
		});
	});
}

function getComments(saveID, start, length, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Comments');
			
			collection.find({'SaveID':saveID}).toArray(function(err, docs) {
				if(length == -1)
				{
					db.close();
					callback_(docs);
				} else {
					pages = Math.floor(docs.length/length)+1;
					relativePage = Math.floor(start/length) % pages;
					db.close();
					callback_(docs.slice(relativePage*20, parseInt(start+length)));
				}
			});
		}
	});
}

function addComment(userID, userKey, comment, saveID, callback_)
{
	IDtoName(userID, function(userName) {
		getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				MongoClient.connect(url, function (err, db) {
					if (err) {
						console.log('Unable to connect to the mongoDB server. Error:', err);
						callback("Database problem");
					} else {
						var collection = db.collection('Comments');
						getComments(saveID, 0, -1, function(comments) {
							collection.insert({
								SaveID: saveID,
								CommentID: comments.length,
								Username: userName,
								UserID: userID,
								Gravatar: "",
								Text: comment,
								Timestamp: Date.now(),
								FormattedUsername: userName
							}, function() {
								console.log("Successfully inserted with Comment " + comment);
								db.close();
								callback_();
							});
						});
					}
				});
			} else {
				callback_("Invalid Login");
			}
		});
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
//You can't say there are no comments; This *is* a comment
