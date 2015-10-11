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
		}
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
					
					data.slice(start).forEach(function (d, i) { //should be rewritten before release
						var saveQuery = {};
						saveQuery['ID'] = data[i+parseInt(start)].SaveID;
						
						getDBInfo('Saves', saveQuery, function(saveData) {
							saveData[0].Version = 0;
							returnJSON.Saves.push(saveData[0]);
							
							if(i == saveCount || i == data.length+start-1)
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

function buildSecondPage(start, saveCount, callback_)
{
	var returnJSON = {};
	
	if(start > 0)
		start = start - 20;
	
	var query = {};
	query['Published'] = true;
	
	getDBInfo('Saves', query, function(data) {
		returnJSON.Saves = sortByKeyInverse(data, 'Score');
		
		returnJSON.Count = returnJSON.Saves.length;
		
		for(var i = start; i < returnJSON.Saves.length; i++)
		{
			returnJSON.Saves[i].Version = 0;
			delete returnJSON.Saves[i]['_id'];
				
			if(i == start+saveCount || i == returnJSON.Saves.length-1)
			{
				callback_(returnJSON);
				break; 
			}
		}
	});
}
