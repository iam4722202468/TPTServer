var mongodb = require('mongodb'),
	fs = require('fs'),
	rimraf = require('rimraf'),
	mkdirp = require('mkdirp');

var validator = require('validator');

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/tpt';

var databaseSimple = require('./databaseSimple.js');

function getTags(saveID, callback_)
{
	var name = 'SaveID';
	var value = saveID;
	var query = {};
	query[name] = parseInt(value);
	
	databaseSimple.getDBInfo('Tags', query, function(data) {
		var returnArray = [];
		if(data.length <= 0)
		{
			callback_(returnArray);
		}
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

function checkKey(userKey, callback_) //checks key which is in the format <userID>|<sessionID>
{
	if(userKey !== undefined) {
		var userKey = userKey.split('|');
		
		if(userKey.length > 1)
		{
			var userID = userKey[0];
			var userHash = userKey[1];
			
			IDtoName(userID, function(userName){
				getSession(userName, function(dataKey) {
					if(dataKey == userHash)
						callback_(true, userName, userID);
					else
						callback_(false, userName, userID);
				});
			});
		} else 
			callback_(false, userName, userID);
	} else
		callback_(false, 0, 0);
}

function checkSaveOwner(saveID, userName, callback_)
{
	var query = {}
	query['ID'] = parseInt(saveID);
						
	databaseSimple.getDBInfo('Saves', query, function(saveData) {
		if(saveData.length > 0 && saveData[0].Username == userName)
			callback_(true);
		else
			callback_(false);
	});
}

function deleteSave(saveID, userKey, callback_)
{
	checkKey(userKey, function(loginCorrect, userName, userID) {
		if(loginCorrect)
		{
			checkSaveOwner(saveID, userName, function(isSame) {
				if(isSame)
				{
					fs.createReadStream(__dirname + "/static/cps/" + saveID + '.cps').pipe(fs.createWriteStream(__dirname + "/static/deleted/" + saveID + '_' + userName + '.cps'));
					
					rimraf(__dirname + "/static/pti/saves/" + saveID, function(){});
					rimraf(__dirname + "/static/cps/" + saveID, function(){});
					
					try {
						fs.unlinkSync(__dirname + "/static/pti/saves/" + saveID + "_small.pti");
						fs.unlinkSync(__dirname + "/static/pti/saves/" + saveID + ".pti");
						fs.unlinkSync(__dirname + "/static/cps/" + saveID + '.cps');
					} catch(e) {
						console.log(e);
					}
					
					getSaveInfo(saveID, function(saveData) {
						fs.writeFile(__dirname + "/static/deleted/" + saveID + '_' + userName + '.json', JSON.stringify(saveData), function(err) {
							if(err) {
								return console.log(err);
							}
							
							var queryID = {};
							queryID["ID"] = parseInt(saveID);
							var query = {};
							query["SaveID"] = parseInt(saveID);
							
							databaseSimple.deleteDBInfo('Favourite',query);	//Favourite
							databaseSimple.deleteDBInfo('Saves', queryID);		//Saves
							databaseSimple.deleteDBInfo('Comments', query);	//Comments
							databaseSimple.deleteDBInfo('Votes', query);		//Votes
							databaseSimple.deleteDBInfo('Tags', query);		//Tags
							
							console.log("Save " + saveID + " was deleted");
							
							callback_();
						});
					});
				}
				else
					callback_("That is not your save!");
			});
		}
		else
			callback_("Invalid SessionKey");
	});
}

function setPublish(saveID, userKey, isPublished, callback_)
{
	checkKey(userKey, function(loginCorrect, userName, userID) {
		if(loginCorrect)
		{
			var query = {}
			query['ID'] = parseInt(saveID);
						
			databaseSimple.getDBInfo('Saves', query, function(saveInfo) {
				if(saveInfo[0].Username == userName)
				{
					databaseSimple.changeDBInfo('Saves', 'ID', parseInt(saveID), 'Published', isPublished);
					callback_();
				}
				else
					callback_("That is not your save!");
			});
		} else
			callback_("Invalid SessionKey");
	});
}

function addTag(saveID, tagValue, userKey, callback_)
{
	if(validator.isAscii(tagValue) && tagValue.length <= 23) {
		checkKey(userKey, function(loginCorrect, userName, userID) {
			if(loginCorrect)
			{
				getTags(saveID, function(saveTags) {
					if(saveTags.indexOf(tagValue) > -1)
						callback_('Tag already exists');
					else
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
					}
				});
			} else {
				callback_('Invalid Login');
			}
		});
	} else {
		callback_("All fields must contain only ascii values");
	}
}

function removeTag(saveID, tagValue, userKey, callback_)
{
	checkKey(userKey, function(loginCorrect, userName, userID) {
		if(loginCorrect)
		{
			MongoClient.connect(url, function (err, db) {
				if (err) {
					console.log('Unable to connect to the mongoDB server. Error:', err);
				} else {
					var collection = db.collection('Tags');
					
					checkSaveOwner(userID, userName, function(isSame) {
						if(isSame)
						{
							collection.remove({$and:[{'SaveID':parseInt(saveID)},{'Tag':tagValue}]});
							db.close();
							callback_();
						} else
							callback_("That is not your save!");
					});
				}
			});
		} else {
			callback_('Invalid Login');
		}
	});
}

function saveVersion(saveID, version)
{
	mkdirp(__dirname + '/static/cps/'+saveID, function(err) { 
		fs.createReadStream(__dirname + '/static/cps/'+saveID+'.cps').pipe(fs.createWriteStream(__dirname + '/static/cps/'+saveID+'/'+saveID+'_'+version+'.cps'));
	});
}

function renderSavePTI(filePath, version, filename, callback_)
{
	var renderer = require("child_process").exec(__dirname + "/render/render64 " + filePath.replace(/^.*[\\\/]/, '') + " " + filename)
	
	renderer.on('exit', function() {
		fs.rename(__dirname + "/render/" + filename + '.png', __dirname + "/static/png/" + filename + '.png');
		fs.rename(__dirname + "/render/" + filename + '-small.png', __dirname + "/static/png/" + filename + '-small.png');
		
		fs.rename(__dirname + "/render/" + filename + '.pti', __dirname + "/static/pti/saves/" + filename + '.pti');
		fs.rename(__dirname + "/render/" + filename + '-small.pti', __dirname + "/static/pti/saves/" + filename + '_small.pti');
		
		mkdirp(__dirname + '/static/pti/saves/'+filename, function(err) {
			fs.createReadStream(__dirname + "/static/pti/saves/" + filename + '.pti').pipe(fs.createWriteStream(__dirname + "/static/pti/saves/" + filename + '/' + filename + '_' + version + '.pti'));
			fs.createReadStream(__dirname + "/static/pti/saves/" + filename + '_small.pti').pipe(fs.createWriteStream(__dirname + "/static/pti/saves/" + filename + '/' + filename + '_' + version + '_small.pti'));
		});
		
		callback_();
	});
}

function getSaveInfo(saveID, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var query = {};
			query['ID'] = parseInt(saveID);
			
			databaseSimple.getDBInfo('Saves', query, function(data) {
				if(data.length > 0)
				{
					if(data[0].Views === undefined)
						databaseSimple.changeDBInfo('Saves', 'ID', saveID, 'Views', 1);
					else
						databaseSimple.changeDBInfo('Saves', 'ID', saveID, 'Views', parseInt(data[0].Views+1));
				} else {
					db.close();
					callback_(-1);
				}
				
				var name = 'SaveID';
				var value = saveID;
				var query = {};
				query[name] = parseInt(value);
				
				databaseSimple.getDBInfo('Comments', query, function(data2) {
					if(data.length > 0)
					{
						delete data[0]._id;
						data[0].Comments = data2.length;
						
						getTags(saveID, function(data3) {
							data[0].Tags = data3;
							db.close();
							callback_(data[0]);
						});
					} else {
						db.close();
						callback_(-1);
					}
					db.close();
				});
			});
		}
	});
}

function checkUser(userName, userHash, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({"Hash":userHash}).toArray(function(err, docs){
				if(docs.length > 0 && docs[0].Name == userName)
					callback_(true);
				else
					callback_(false);

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

function checkLastID(callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Info');	
			
			collection.find().toArray(function(err, docs){
				var lastID = {User:docs[0].LastUserID, Save:docs[0].LastSaveID};
				
				db.close();
				callback_(lastID);
			});
		}
	});
}

function getUser(userName, callback_)
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
							else if(name == "Biography" || name == "ID" || name == "Location" || name == "Name" || name == "Age" || name == "Website")
								toReturn.User[name] = docs[0][name];
						}
					}
					
					callback_(JSON.stringify(toReturn));
				}
				else
					callback_('{"User":{"Username":"NULL","ID":0}}');

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
				if(docs.length == 0)
					callback_("Invalid Username");
				else
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
		} else if(info.Biography.length < 1000 && info.Location.length <= 33 && validator.isAscii(info.Biography) && validator.isAscii(info.Location)){
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
	if(userName == "Invalid Username")
		callback_("Invalid Username");
	else {
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
}

function saveVote(userID, userKey, saveID, voteDirection, callback_)
{
	IDtoName(userID, function(userName) {
		getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
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
										db.collection("Saves", function(error, saveCollection) {
											if(voteInt == 1)
												saveCollection.update({"ID":parseInt(saveID)}, {$inc: {"ScoreUp":1}});
											else
												saveCollection.update({"ID":parseInt(saveID)}, {$inc: {"ScoreDown":1}});
											
											saveCollection.update({"ID":parseInt(saveID)}, {$inc: {"Score":voteInt}});
											db.close();
											callback_("Success");
										});
									});
								});
							}
						});
					} else {
						callback_('You already voted');
					}
				});
			} else {
				callback_("Invalid Login");
			}
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

function getFavourite(userID, saveID, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Favourite');
			
			collection.find({$and:[{'SaveID':parseInt(saveID)},{'UserID':parseInt(userID)}]}).toArray(function(err, docs){
				db.close();
				
				if(docs.length < 1)
					callback_(false);
				else
					callback_(true)
			});
		}
	});
}

function addFavourite(saveID, userKey, callback_)
{
	checkKey(userKey, function(loginCorrect, userName, userID) {
		if(loginCorrect)
		{
			MongoClient.connect(url, function (err, db) {
				if (err) {
					console.log('Unable to connect to the mongoDB server. Error:', err);
				} else {
					db.collection("Favourite", function(error, collection) {
						collection.remove({$and:[{'SaveID':parseInt(saveID)},{'UserID':parseInt(userID)}]});
						
						collection.insert({
							SaveID: parseInt(saveID),
							UserID: parseInt(userID)
						}, function() {
							console.log(userID + " successfully favorited to save " + saveID);
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
}

function removeFavourite(saveID, userKey, callback_)
{
	checkKey(userKey, function(loginCorrect, userName, userID) {
		if(loginCorrect)
		{
			MongoClient.connect(url, function (err, db) {
				if (err) {
					console.log('Unable to connect to the mongoDB server. Error:', err);
				} else {
					var collection = db.collection('Favourite');
					collection.remove({$and:[{'SaveID':parseInt(saveID)},{'UserID':parseInt(userID)}]});
					console.log(userID + " successfully removed favorite from save " + saveID);
					db.close();
					callback_();
				}
			});
		} else {
			callback_("Invalid Login");
		}
	});
}

function reportSave(userID, userKey, reason, saveID, callback_)
{
	if(reason.length < 1500 && validator.isAscii(reason)) {
		IDtoName(userID, function(userName) {
			getSession(userName, function(dataKey) {
				if(dataKey == userKey)
				{
					fs.stat(__dirname + '/Reports/' + userID, function(err, stat) {
						if(err == null) {
							fs.appendFile(__dirname + '/Reports/' + userID, "Save ID: " + saveID + " | Reason: " + reason + '\n', function (err) {
								if(err)
								{
									console.log(err);
									callback_(err);
								}
								callback_();
							});
						} else if(err.code == 'ENOENT') {
							fs.writeFile(__dirname + '/Reports/' + userID, "Save ID: " + saveID + " | Reason: " + reason + '\n');
							callback_('Error: ENOENT');
						} else {
							console.log('Some other error: ', err.code);
							callback_(err.code);
						}
					});
				} else {
					callback_("Invalid Login");
				}
			});
		});
	} else {
		if(reason.length >= 1500)
			callback_("Reason too long");
		else
			callback_("All fields must contain only ascii values");
	}
}

function addSave(userID, userKey, saveName, saveDescription, savePublish, time, callback_)
{
	if(validator.isAscii(saveName) && (validator.isAscii(saveDescription) || saveDescription == "")) {
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
												DateCreated: time,
												Date: time,
												Version: 0,
												Score: 0,
												ScoreUp: 0,
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
											collection.update({"ID" : newSaveID}, {$set: {'Date':time}});
											collection.update({"ID" : newSaveID}, {$set: {'Description':saveDescription}});
											collection.update({"ID" : newSaveID}, {$set: {'Published':savePublish}});
											console.log("The last version is " + parseInt(lastVersion+1));
											callback_({'ID':newSaveID, 'Version':lastVersion+1});
										});
									}
								});
							});
						}
					});
				} else {
					console.log("Invalid login from " + userName);
					callback_("Invalid login");
				}
			});
		});
	} else {
		if(saveName == "")
			callback_("Save must have a name");
		else
			callback_("All fields must contain only ascii values");
	}
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
					docs = docs.reverse();
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
	if(validator.isAscii(comment)) {
		if(comment.length < 1500) //max comment length
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
										Timestamp: parseInt(new Date()/1000),
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
		} else
			callback_("Comment too long");
	 } else
		callback_("All fields must contain only ascii values");
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

module.exports.generateHash = generateHash;
module.exports.getSession = getSession;
module.exports.IDtoName = IDtoName;
module.exports.login = login;
module.exports.getComments = getComments
module.exports.addComment = addComment
module.exports.addSave = addSave;
module.exports.reportSave = reportSave;
module.exports.addFavourite = addFavourite;
module.exports.getFavourite = getFavourite;
module.exports.getVote = getVote;
module.exports.saveVote = saveVote;
module.exports.setProfile = setProfile;
module.exports.getUser = getUser;
module.exports.checkLastID = checkLastID;
module.exports.checkUser = checkUser;
module.exports.getSaveInfo = getSaveInfo;
module.exports.renderSavePTI = renderSavePTI;
module.exports.saveVersion = saveVersion;
module.exports.removeTag = removeTag;
module.exports.addTag = addTag;
module.exports.setPublish = setPublish;
module.exports.deleteSave = deleteSave;
module.exports.getTags = getTags;
module.exports.removeFavourite = removeFavourite;
