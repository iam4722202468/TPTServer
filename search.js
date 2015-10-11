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

function buildFavouriteSearch(userID, start, saveCount, query, callback_)
{
	var searchable = ['ID', 'DateCreated', 'Date', 'Version', 'Score', 'ScoreUp', 'ScoreDown', 'Views', 'Name', 'ShortName', 'Username', 'Published'];
	
	buildFavourite(userID, start, saveCount, function(data) {
		
		var returnJSON = data;
		
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
						returnJSON.Saves = sortByKeyInverse(returnJSON.Saves, searchable[searchPlace]);
					else
						returnJSON.Saves = sortByKey(returnJSON.Saves, searchable[searchPlace]);
						
					callback_(returnJSON);
					break;
				}
			}
		}
	});
}

function buildBy(userName, start, saveCount, callback_)
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
}

function buildFavourite(userID, start, saveCount, callback_)
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
		
		data.slice(start).forEach(function (d, i) {
			getSaveInfo(data[i+parseInt(start)].SaveID, function(saveData) {
				saveData.Version = 0;
				returnJSON.Saves.push(saveData);
				
				if(i == saveCount || i == data.length - 1 - start)
					callback_(returnJSON);
			});
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
