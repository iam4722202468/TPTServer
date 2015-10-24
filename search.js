function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function sortByKeyInverse(array, key) {
    return array.sort(function(b, a) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function buildSortSaves(saveArray, query, callback_)
{
	console.log(query);
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
	buildFavourite(userID, userKey, start, saveCount, function(data) {
		buildSortSaves(data.Saves, query, function(arrangedSaves) {
			data.Saves = arrangedSaves;
			callback_(data);
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
					
					data = sortByKeyInverse(data, 'Score');
					
					if(data.length == 0)
					{
						returnJSON.Count = 0;
						callback_(returnJSON);
					}
					
					returnJSON.Count = data.length;
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
					
					if(data.length - parseInt(saveCount) - parseInt(start) < 0)
						saveCount = data.length%20;
					
					data.slice(start, start+saveCount).forEach(function (d, i) { //should be rewritten before release 
						//db.Saves.find({$or:[{ID:3}, {ID:4}]})
						var saveQuery = {};
						saveQuery['ID'] = d.SaveID;
						
						getDBInfo('Saves', saveQuery, function(saveData) {
							saveData[0].Version = 0;
							returnJSON.Saves.push(saveData[0]);
							
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
	console.log(returnJSON, start,saveCount);
	
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

function buildByAllSearch(start, saveCount, query, callback_)
{
	var returnJSON = {};
	
	//write function to search saves and tags for query
		//this can be used while there's nothing written
	
	getSaves(function(data) {
		if(query.split(" ")[query.split(" ").length-1].split(":")[0] == "sort" && query.split(" ")[query.split(" ").length-1].split(":").length == 2 && query.split(" ")[query.split(" ").length-1].split(":")[1] != "")
		{
			buildSortSaves(data, query.split(" ")[query.split(" ").length-1], function(sortedSaves) {
				console.log();
				if(sortedSaves.length > 0)
				{
					sliceSaves({Saves:sortedSaves}, start, saveCount, function(sendData) {
						callback_(sendData);
					});
				}
				else
					callback_();
			});
			
		} else {
			returnJSON.Saves = data;
			sliceSaves(returnJSON, start, saveCount, function(sendData) {
				callback_(sendData);
			});
		}
	});
}

function buildBySort(sortBy, start, saveCount, callback_)
{
	var returnJSON = {};
	
	getSaves(function(data) {
		returnJSON.Saves = sortByKeyInverse(data, sortBy);
		sliceSaves(returnJSON, start, saveCount, function(sendData) {
			callback_(sendData);
		});
	});
}
