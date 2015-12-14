var database = require('./database.js');
var databaseSimple = require('./databaseSimple.js');

var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	url = 'mongodb://localhost:27017/tpt',
	fs = require('fs');

function sortByKeyInverse(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function sortByKey(array, key) {
    return array.sort(function(b, a) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function buildSortSaves(saveArray, query, callback_)
{
	var searchable = ['ID', 'DateCreated', 'Date', 'Version', 'Score', 'ScoreUp', 'ScoreDown', 'Views', 'Name', 'ShortName', 'Username', 'Published'];
	
	if(query.substr(0, 5) == 'sort:')
	{
		if(query.substr(5, 1) == '!')
		{
			var sortType = 'invert';
			var searchString = query.substr(6);
		}
		else
		{
			var sortType = 'normal';
			var searchString = query.substr(5);
		}
		
		for(var searchPlace in searchable)
		{
			if(searchable[searchPlace].toLowerCase() == searchString.toLowerCase())
			{
				if(sortType == 'invert')
					saveArray = sortByKeyInverse(saveArray, searchable[searchPlace]);
				else
					saveArray = sortByKey(saveArray, searchable[searchPlace]);
					
				callback_(saveArray);
				break;
			}
			if(searchPlace == searchable.length-1)
			{
				callback_([]);
			}
		}
	} else {
		callback_([]);
	}
}

function buildByHistory(saveID, start, saveCount, callback_)
{
	try {
		var saves = fs.readdirSync(__dirname + '/static/cps/'+saveID);
	} catch(e) {
		var saves = undefined;
		console.log(e);
	}
	
	var returnJSON = {};
	returnJSON.Saves = [];
	
	var saveQuery = {};
	saveQuery['ID'] = saveID;
	
	databaseSimple.getDBInfo('Saves', saveQuery, function(data) {
		if(data.length > 0 && saves !== undefined)
		{
			data[0].Version = 0;
			delete data[0]['_id'];
			saveData = data;
			
			var originalName = data[0].Name;
			
			saves.forEach(function(d, i) {
				appendData = JSON.parse(JSON.stringify(data[0]));	//copy object
				if(parseInt(saves.length - i - 1) == 0)				//make newest save have largest version number
					appendData.Name = originalName + " (" + parseInt(i+1) + ")";
				else
					appendData.Name = originalName + " (" + parseInt(saves.length - i - 1) + ")";
				appendData.Version = parseInt(saves.length - i - 1);
				
				returnJSON.Saves.push(appendData);
				
				if(i == saves.length - 1) {
					sliceSaves(returnJSON, start, saveCount, function(returnJSON) {
						callback_(returnJSON);
					});
				}
			});
		} else
			callback_({"Status":0,"Error":"No save found with that ID"});
	});
}

function buildByUser(userName, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Saves');
			
			collection.find({$and:[{Username:userName},{Published:true}]}).toArray(function(err, docs){
				db.close();
				setVersion(docs, 0, function(saves) {
					callback_(saves);
				});
			});
		}
	});
}

function buildByOwn(userID, userKey, callback_)
{
	database.IDtoName(userID, function(userName){
		database.getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				var query = {};
				query['Username'] = userName;
				
				databaseSimple.getDBInfo('Saves', query, function(data) {
					if(data.length == 0)
						callback_({Saves:[]});
					else
						setVersion(data, 0, function(saves) {
							callback_(saves);
						});
				});
			} else {
				callback_("Invalid Login");
			}
		});
	});
}

function buildByFavourite(userID, userKey, callback_)
{
	database.IDtoName(userID, function(userName){
		database.getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				var query = {};
				query['UserID'] = parseInt(userID);
				
				databaseSimple.getDBInfo('Favourite', query, function(data) {
					if(data.length == 0)
						callback_({Saves:[]});
					else
						databaseSimple.getSavesFromList(data, function(saves) {
							callback_(saves);
						});
				});	
			} else {
				callback_('Invalid Login');
			}
		});
	});
}

function getSaves(callback_)
{
	var returnJSON = {};
	
	var query = {};
	query['Published'] = true;
	
	databaseSimple.getDBInfo('Saves', query, function(data) {
		setVersion(data, 0, function(saves) {
			callback_(saves.Saves);
		});
	});
}

function sliceSaves(returnJSON, start, saveCount, callback_)
{
	if(returnJSON.Saves.length == 0)
	{
		callback_({"Status":0,"Error":"No saves found"});
	} else {
		returnJSON.Count = returnJSON.Saves.length;
		originalSaves = returnJSON.Saves;
		returnJSON.Saves = [];
		
		if(returnJSON.Count - parseInt(saveCount) - parseInt(start) < 0)
			saveCount = returnJSON.Count%20;
		
		originalSaves.slice(start, start+saveCount).forEach(function (d, i) {
			delete d['_id'];
			returnJSON.Saves.push(d);
			
			if(i == parseInt(saveCount)-1 || i == parseInt(returnJSON.Count)+parseInt(start)-1)
			{
				callback_(returnJSON);
			}
		});
	}
}

function searchByString(searchString, data, callback_)
{
	var returnJSON = {"Saves":[]};
	var saveIDArray = [];
	
	data.forEach(function(d, i) {
		database.getTags(d.ID, function(tagData) {
			data[i].Tags = tagData;
			if(i == data.length-1)
			{
				var fs = require('fs');
				var filename = database.generateHash();
				fs.writeFile(__dirname + "/tmp/"+filename, JSON.stringify(data), function(err) {
					var exec = require('child_process').exec;
					var child = exec(__dirname + '/search/search ' + __dirname + "/tmp/"+filename + ' 100 ' + searchString);
					
					child.stdout.on('data', function(data) {
						data = data.split("\n");
						saveIDArray = saveIDArray.concat(data);
							
					});
						
					child.on('close', function(code) {
						if(saveIDArray.length == 0)
						{
							fs.unlinkSync(__dirname + "/tmp/"+filename);
							callback_(returnJSON);
						}
						else
						{
							saveIDArray.forEach(function(d, i) {
								if(d != '')
								{
									var saveQuery = {};
									saveQuery['ID'] = parseInt(d);
									
									databaseSimple.getDBInfo('Saves', saveQuery, function(saveData) {
										saveData[0].Version = 0;
										returnJSON.Saves.push(saveData[0]);
										
										if(i == saveIDArray.length-2)
										{
											fs.unlinkSync(__dirname + "/tmp/"+filename);
											callback_(returnJSON);
										}
									});
								}
							});
						}
					});
				});
			}
		});
	});
}

function searchAndSort(start, saveCount, data, query, callback_)
{
	var returnJSON = {};
	
	var lastString = query.split(" ")[query.split(" ").length-1];
	
	if(data === undefined || data.length == 0)
		callback_({"Status":0,"Error":"No saves found"});
	else if(query == '')
	{
		returnJSON.Saves = sortByKey(data, 'Score');
		sliceSaves(returnJSON, start, saveCount, function(sendData) {
			callback_(sendData);
		});
	}
	else if(lastString.split(":")[0] == "sort" && lastString.split(":").length == 2 && lastString.split(":")[1] != "")
	{
		if(query.split(" ").length > 1)
		{
			searchByString(query.split(" ").splice(0, query.split(" ").length-1).join(" "), data, function(queryData) {
				returnJSON = queryData;
				
				if(returnJSON.Saves.length == 0)
				{
					callback_({"Status":0,"Error":"No saves found"});
				} else {
					buildSortSaves(queryData.Saves, query.split(" ")[query.split(" ").length-1], function(sortedSaves) {
						if(sortedSaves.length > 0)
							sliceSaves({Saves:sortedSaves}, start, saveCount, function(sendData) {
								callback_(sendData);
							});
						else
							callback_({"Status":0,"Error":"No saves found"});
					});
				}
			});
		} else {
			buildSortSaves(data, query.split(" ")[query.split(" ").length-1], function(sortedSaves) {
				if(sortedSaves.length > 0)
					sliceSaves({Saves:sortedSaves}, start, saveCount, function(sendData) {
						callback_(sendData);
					});
				else
					callback_({"Status":0,"Error":"No saves found"});
			});
		}
	
	} else {
		searchByString(query, data, function(queryData) {
			returnJSON = queryData;
			
			if(returnJSON.Saves.length == 0)
			{
				callback_({"Status":0,"Error":"No saves found"});
			} else
				sliceSaves(returnJSON, start, saveCount, function(sendData) {
					callback_(sendData);
				});
		});
	}
}

function setVersion(saves, version, callback_)
{
	if(saves === undefined || saves.length == 0)
		callback_({Count:0, Saves:[]});
	else
	{
		saves.forEach(function(d, i) {
			saves[i].Version = version;
			if(i == saves.length - 1)
				callback_({Count:saves.length, Saves:saves});
		});
	}
}

function FPSort(a,b)
{
	if (a.FPScore < b.FPScore)
		return 1;
	if (a.FPScore > b.FPScore)
		return -1;
	return 0;
}

function buildFP(start, saveCount, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Saves');
			
			collection.find({$and:[{Published:true}, {DateCreated:{$gt: parseInt(new Date()/1000)-604800*4}}]}).toArray(function(err, docs){
				db.close();
				
				sliceSaves({Saves:docs}, start, saveCount, function(sendData) {
					setVersion(sendData.Saves, 0, function(saves) {
						if(saves.Saves.length > 0)
						{
							saves.Saves.forEach(function(d, i) {
								saves.Saves[i].FPScore = (d.Score/parseInt(new Date()/1000-d.DateCreated))*1000000;
								
								if(i == saves.Saves.length - 1)
								{
									saves.Saves = saves.Saves.sort(FPSort);
									callback_(saves);
								}
							});
						} else {
							callback_({Count:1, Saves:[], Error:"No saves currently on front page"});
						}
					});
				});
				
			});
		}
	});
}

function buildByAllSearch(start, saveCount, query, callback_)
{
	getSaves(function(data) {
		searchAndSort(start, saveCount, data, query, function(returnJSON) {
			if(returnJSON === undefined)
				callback_({"Status":0,"Error":"No saves found"});
			else
				callback_(returnJSON);
		});
	});
}

function buildBySort(sortBy, start, saveCount, callback_)
{
	var returnJSON = {};
	
	if(start%20 == 0 && saveCount == 20)
		start -= 20;
		
	getSaves(function(data) {
		returnJSON.Saves = sortByKey(data, sortBy);
		sliceSaves(returnJSON, start, saveCount, function(sendData) {
			callback_(sendData);
		});
	});
}

module.exports.setVersion = setVersion;
module.exports.buildBySort = buildBySort;
module.exports.buildByAllSearch = buildByAllSearch;
module.exports.buildFP = buildFP;
module.exports.searchAndSort = searchAndSort;
module.exports.buildByFavourite = buildByFavourite;
module.exports.buildByOwn = buildByOwn;
module.exports.buildByUser = buildByUser;
module.exports.buildByHistory = buildByHistory;
module.exports.buildSortSaves = buildSortSaves;
