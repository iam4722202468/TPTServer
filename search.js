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

function buildFavourite(userID, start, saveCount, callback_)
{
	var returnJSON = {};
	returnJSON.Saves = [];
	
	var query = {};
	query['UserID'] = parseInt(userID);
	
	console.log(query);
	
	getDBInfo('Favourite', query, function(data) {
		if(data.length == 0)
		{
			returnJSON.Count = 0;
			callback_(returnJSON);
		}
		
		if(saveCount > data.length)
			returnJSON.Count = data.length;
		else
			returnJSON.Count = saveCount;
		
		for(var i in data)
		{
			getSaveInfo(data[i].SaveID, function(saveData) {
				saveData.Version = 0;
				returnJSON.Saves.push(saveData);
				
				if(i == saveCount-1 || i == returnJSON.Saves.length-1)
					callback_(returnJSON);
			});
		}
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
		
		if(saveCount > returnJSON.Saves.length)
			returnJSON.Count = returnJSON.Saves.length;
		else
			returnJSON.Count = start + saveCount;
		
		for(var i = start; i < returnJSON.Saves.length; i++)
		{
			if(i <= saveCount || i <= returnJSON.Saves.length)
			{
				returnJSON.Saves[i].Version = 0;
				delete returnJSON.Saves[i]['_id'];
				
				if(i == saveCount-1 || i == returnJSON.Saves.length-1)
				{
					callback_(returnJSON);
					break; 
				}
			}
		}
	});
}
