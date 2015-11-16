function getDBInfo(dbCollection, query, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection(dbCollection);
			
			collection.find(query).toArray(function(err, docs){
				db.close();
				callback_(docs);
			});
		}
	});
}

function deleteDBInfo(dbCollection, query)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection(dbCollection);
			collection.remove(query);
			db.close();
		}
	});
}

function changeDBInfo(dbCollection, searchKey, searchValue, newKey, newValue)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection(dbCollection);
			
			var query = {};
			query[searchKey] = parseInt(searchValue);
			
			var change = {};
			
			if(newValue == true)
				change[newKey] = true;
			else if(newValue == false)
				change[newKey] = false;
			else
				change[newKey] = parseInt(newValue);
			
			collection.update(query, {$set: change});
			
			db.close();
			return 0;
		}
	});
}
