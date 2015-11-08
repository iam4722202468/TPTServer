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
	var lastString = query.split(" ")[query.split(" ").length-1];
	var secondLastString;
	
	if(query.split(" ").length >= 2)
		secondLastString = query.split(" ")[query.split(" ").length-2];
	else
		secondLastString = "";
	
	var endingsFound = 0;
	var firstEnding = "";
	var userSearch = "";
	
	if(lastString.split(":")[0] == "sort" && lastString.split(":").length == 2 && lastString.split(":")[1] != "")
	{
		firstEnding = "sort"
		endingsFound = 1;
	}
	else if (lastString.split(":")[0] == "user" && lastString.split(":").length == 2 && lastString.split(":")[1] != "")
	{
		userSearch = lastString.split(":")[1];
		query = query.split(" ").splice(0, query.split(" ").length-1).join(" ") + " sort:score";
		endingsFound = 1;
	}
	
	if((lastString.split(":")[0] == "sort" && lastString.split(":").length == 2 && lastString.split(":")[1] != "") &&
		(secondLastString.split(":")[0] == "user" && secondLastString.split(":").length == 2 && secondLastString.split(":")[1] != ""))
	{
		userSearch = userSearch = secondLastString.split(":")[1];
		query = query.split(" ").splice(0, query.split(" ").length-2).join(" ") + " " + query.split(" ")[query.split(" ").length-1];
		endingsFound = 2;
	}
	else if((lastString.split(":")[0] == "user" && lastString.split(":").length == 2 && lastString.split(":")[1] != "") &&
		(secondLastString.split(":")[0] == "sort" && secondLastString.split(":").length == 2 && secondLastString.split(":")[1] != ""))
	{
		userSearch = lastString.split(":")[1];
		query = query.split(" ").splice(0, query.split(" ").length-1).join(" ");
		endingsFound = 2;
	}
	
	
	console.log(endingsFound);
	
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
				callback_(['']);
			}
		}
	} else {
		callback_(['']);
	}
}

function buildFavouriteSearch(userID, userKey, start, saveCount, query, callback_)
{
	buildFavourite(userID, userKey, start, -1, function(data) {
		searchAndSort(start, saveCount, data.Saves, query, function(returnJSON) {
			callback_(returnJSON);
		});
	});
}

function buildByOwnSearch(userID, userKey, start, saveCount, query, callback_)
{
	buildByOwn(userID, userKey, start, -1, function(data) {
		searchAndSort(start, saveCount, data.Saves, query, function(returnJSON) {
			callback_(returnJSON);
		});
	});
}

function buildByOwn(userID, userKey, start, saveCount, callback_)
{
	IDtoName(userID, function(userName){
		getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				var returnJSON = {};
				returnJSON.Saves = [];
				
				var query = {};
				query['Username'] = userName;
				
				getDBInfo('Saves', query, function(data) {
					
					data = sortByKey(data, 'Score');
					
					if(data.length == 0)
					{
						returnJSON.Count = 0;
						callback_(returnJSON);
					}
					
					returnJSON.Count = data.length;
					
					if(saveCount == -1) //for when sorting by favourite
					{
						start = 0;
						saveCount = returnJSON.Count;
					}
					
					for(var i = start; i < data.length; i++)
					{
						data[i].Version = 0;
						delete data[i]['_id'];
						returnJSON.Saves.push(data[i]);
						
						if(i == start+saveCount || i == data.length-1)
						{
							callback_(returnJSON);
							break;
						}
					}
				});
			} else {
				callback_("Invalid Login");
			}
		});
	});
}

function buildFavourite(userID, userKey, start, saveCount, callback_)
{
	IDtoName(userID, function(userName){
		getSession(userName, function(dataKey) {
			if(dataKey == userKey)
			{
				var returnJSON = {};
				returnJSON.Saves = [];
				
				var query = {};
				query['UserID'] = parseInt(userID);
				
				getDBInfo('Favourite', query, function(data) {
					if(data.length == 0)
					{
						returnJSON.Count = 0;
						callback_(returnJSON);
					}
					
					returnJSON.Count = data.length;
					
					if(saveCount == -1) //for when sorting by favourite
					{
						start = 0;
						saveCount = returnJSON.Count;
					}
					
					if(data.length - parseInt(saveCount) - parseInt(start) < 0)
						saveCount = data.length%20;
					
					data.slice(start, start+saveCount).forEach(function (d, i) { //should be rewritten before release 
						//db.Saves.find({$or:[{ID:3}, {ID:4}]})
						var saveQuery = {};
						saveQuery['ID'] = d.SaveID;
						
						getDBInfo('Saves', saveQuery, function(saveData) {
							if(saveData.length > 0)
							{
								saveData[0].Version = 0;
								returnJSON.Saves.push(saveData[0]);
							}
							
							if(i == saveCount-1 || i == data.length+start-1)
								callback_(returnJSON);
						});
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
	
	getDBInfo('Saves', query, function(data) {
		callback_(data);
	});
}

function sliceSaves(returnJSON, start, saveCount, callback_)
{
	returnJSON.Count = returnJSON.Saves.length;
	originalSaves = returnJSON.Saves;
	returnJSON.Saves = [];
	
	if(returnJSON.Count - parseInt(saveCount) - parseInt(start) < 0)
		saveCount = returnJSON.Count%20;
	
	originalSaves.slice(start, start+saveCount).forEach(function (d, i) {
		d.Version = 0;
		delete d['_id'];
		returnJSON.Saves.push(d);
		
		if(i == parseInt(saveCount)-1 || i == parseInt(returnJSON.Count)+parseInt(start)-1)
			callback_(returnJSON);
	});
}

function searchByString(searchString, data, callback_)
{
	var returnJSON = {"Saves":[]};
	var saveIDArray = [];

	data.forEach(function(d, i) {
		getTags(d.ID, function(tagData) {
			data[i].Tags = tagData;
			if(i == data.length-1)
			{
				var fs = require('fs');
				var filename = generateHash();
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
									
									getDBInfo('Saves', saveQuery, function(saveData) {
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
	
	if((lastString.split(":")[0] == "sort" && lastString.split(":").length == 2 && lastString.split(":")[1] != "") ||
		(lastString.split(":")[0] == "user" && lastString.split(":").length == 2 && lastString.split(":")[1] != ""))
	{
		if(query.split(" ").length > 1)
		{
			var searchString = query.split(" ").slice(0, query.split(" ").length -1).join(" ");
			
			searchByString(searchString, data, function(queryData) {
				returnJSON = queryData;
				
				if(returnJSON.Saves.length == 0)
				{
					returnJSON.Count = 0;
					callback_();
				} else
					buildSortSaves(queryData.Saves, query.split(" ")[query.split(" ").length-1], function(sortedSaves) {
						if(sortedSaves.length > 0)
							sliceSaves({Saves:sortedSaves}, start, saveCount, function(sendData) {
								callback_(sendData);
							});
						else
							callback_();
					});
			});
		} else {
			buildSortSaves(data, query.split(" ")[query.split(" ").length-1], function(sortedSaves) {
				if(sortedSaves.length > 0)
					sliceSaves({Saves:sortedSaves}, start, saveCount, function(sendData) {
						callback_(sendData);
					});
				else
					callback_();
			});
		}
	
	} else {
		searchByString(query, data, function(queryData) {
			returnJSON = queryData;
			
			if(returnJSON.Saves.length == 0)
			{
				returnJSON.Count = 0;
				callback_();
			} else
				sliceSaves(returnJSON, start, saveCount, function(sendData) {
					callback_(sendData);
				});
		});
	}
}

function buildByAllSearch(start, saveCount, query, callback_)
{
	getSaves(function(data) {
		searchAndSort(start, saveCount, data, query, function(returnJSON) {
			callback_(returnJSON);
		});
	});
}

function buildBySort(sortBy, start, saveCount, callback_)
{
	var returnJSON = {};
	
	getSaves(function(data) {
		returnJSON.Saves = sortByKey(data, sortBy);
		sliceSaves(returnJSON, start, saveCount, function(sendData) {
			callback_(sendData);
		});
	});
}
