function getDBInfo(dbCollection, query, _callback)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection(dbCollection);
			
			collection.find(query).toArray(function(err, docs){
				db.close();
				_callback(docs);
			});
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
			
			var name = searchKey;
			var value = searchValue;
			var query = {};
			query[name] = parseInt(value);
			
			var newname = newKey;
			var newvalue = parseInt(newValue);
			var change = {};
			change[newname] = newvalue;
			
			collection.update(query, {$set: change});
			
			db.close();
			return 0;
		}
	});
}
