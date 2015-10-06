var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/tpt';

function getTags(saveID, callback_)
{
	var name = 'SaveID';
	var value = saveID;
	var query = {};
	query[name] = parseInt(value);
	
	getDBInfo('Tags', query, function(data) {
		var returnArray = [];
		for(x in data)
		{
			returnArray.push(data[x].Tag);
			if(parseInt(x)+1 == data.length)
			{
				callback_(returnArray);
			}
		}
	});
}

function addTag(saveID, tagValue, userKey, callback_)
{
	var userKey = userKey.split('|');
	
	if(userKey.length > 1)
	{
		var userID = userKey[0];
		var userHash = userKey[1];
		
		console.log(userKey);
		IDtoName(userID, function(userName){
			getSession(userName, function(dataKey) {
				console.log(dataKey);
				if(dataKey == userHash)
				{
					MongoClient.connect(url, function (err, db) {
						if (err) {
							console.log('Unable to connect to the mongoDB server. Error:', err);
						} else {
							db.collection("Tags", function(error, collection) {
								collection.insert({
									SaveID: parseInt(saveID),
									UserID: parseInt(userID),
									Tag: tagValue
								}, function() {
									console.log(userName + " successfully added tag to save " + saveID);
									db.close();
									callback_();
								});
							});
						}
					});
				} else {
					callback_('Invalid Login');
				}
			});
		});
	} else {
		callback_('User login incorrect');
	}
}

function saveVersion(saveID, version)
{
	mkdirp('./static/'+saveID, function(err) { 
		fs.createReadStream('./static/'+saveID+'.cps').pipe(fs.createWriteStream('./static/'+saveID+'/'+saveID+'_'+version+'.cps'));
	});
}

function getSaveInfo(saveID, _callback)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var name = 'ID';
			var value = saveID;
			var query = {};
			query[name] = parseInt(value);
			
			getDBInfo('Saves', query, function(data) {
				if(data.length > 0)
				{
					if(data[0].Views === undefined)
					{
						changeDBInfo('Saves', 'ID', saveID, 'Views', 1, function(returnval)
						{
							console.log(returnval);
						});
					}
					else
					{
						changeDBInfo('Saves', 'ID', saveID, 'Views', parseInt(data[0].Views+1), function(returnval) {
							console.log(returnval);
						});
					}
				}
				
				var name = 'SaveID';
				var value = saveID;
				var query = {};
				query[name] = parseInt(value);
				
				getDBInfo('Comments', query, function(data2) {
					if(data.length > 0)
					{
						delete data[0]._id;
						data[0].Comments = data2.length;
						
						checkTotalVotes(saveID, function(voteData) {
							data[0].Score = voteData.Up - voteData.Down;
							data[0].ScoreUp = voteData.Up;
							data[0].ScoreDown = voteData.Down;
							
							getTags(saveID, function(data3) {
								data[0].Tags = data3;
								_callback(data[0]);
							});
						});
						
					} else {
						_callback(-1);
					}
					db.close();
				});
			});
		}
	});
}

function checkTotalVotes(saveID, callback_)
{
	var name = 'SaveID';
	var value = saveID;
	var query = {};
	query[name] = parseInt(value);
	var totalVotesUp = 0;
	var totalVotesDown = 0;
	
	getDBInfo('Votes', query, function(voteArray) {
		for(var x in voteArray)
		{
			if(voteArray[x].Vote == 1)
				totalVotesUp += 1;
			else if(voteArray[x].Vote == -1)
				totalVotesDown += 1;
			
			if(x == voteArray.length-1)
				callback_({'Up':totalVotesUp, 'Down':totalVotesDown});
		}
		if(voteArray.length == 0)
		{
			callback_({'Up':totalVotesUp, 'Down':totalVotesDown});
		}
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

function IDtoName(userID, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({"ID":parseInt(userID)}).toArray(function(err, docs) {
				db.close();
				callback_(docs[0].Name);
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

function saveVote(userID, userKey, saveID, voteDirection, callback_)
{
	IDtoName(userID, function(userName) {
		getSession(userName, function(dataKey) {
			getVote(userID, saveID, function(userVote) {
				if(userVote == 0)
				{
					MongoClient.connect(url, function (err, db) {
						if (err) {
							console.log('Unable to connect to the mongoDB server. Error:', err);
						} else {
							if(voteDirection == "Up")
								var voteInt = 1;
							else
								var voteInt = -1;
							db.collection("Votes", function(error, collection) {
								collection.insert({
									SaveID: parseInt(saveID),
									UserID: parseInt(userID),
									Vote: voteInt
								}, function() {
									console.log(userName + " successfully voted on save " + saveID);
									db.close();
									callback_("Success");
								});
							});
						}
					});
				} else {
					callback_('You already voted');
				}
			});
		});
	});
}

function getVote(userID, saveID, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Votes');
			
			collection.find({$and:[{'SaveID':parseInt(saveID)},{'UserID':parseInt(userID)}]}).toArray(function(err, docs){
				db.close();
				
				if(docs.length < 1)
					callback_(0);
				else
					callback_(docs[0].Vote)
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
											Created: Math.floor(new Date() / 1000),
											Updated: Math.floor(new Date() / 1000),
											Version: 0,
											Score: 1,
											ScoreUp: 1,
											ScoreDown: 0,
											Name: saveName,
											ShortName: saveName,
											Description: saveDescription,
											Published: savePublish,
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
										collection.update({"ID" : newSaveID}, {$set: {'Updated':Math.floor(new Date() / 1000)}});
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
			
			collection.find({'SaveID':parseInt(saveID)}).toArray(function(err, docs) {
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
								SaveID: parseInt(saveID),
								CommentID: comments.length,
								Username: userName,
								UserID: userID,
								Gravatar: "",
								Text: comment,
								Timestamp: Math.floor(new Date() / 1000),
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
			callback_('{"Status":1,"UserID":' + JSON.parse(userdata).User.ID + ',"SessionID":"' + data + '","SessionKey":"' + JSON.parse(userdata).User.ID + '|' + data + '"}'); //{"Status":1,"UserID":47804,"SessionID":"A12B4CFVTTBTBT4NVI84598G58G958","SessionKey":"DB12346736","Elevation":"None","Notifications":[]}
		});
	});
}
//You can't say there are no comments; This *is* a comment
