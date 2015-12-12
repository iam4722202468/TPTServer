var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	url = 'mongodb://localhost:27017/tpt';

var search = require('./search.js');

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

function getSavesFromList(searchArray, callback_)
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('Saves');
			var saveArray = [];
			
			searchArray.forEach(function(d, i) {
				saveArray.push({ID:d.SaveID});
				
				if(i == searchArray.length - 1)
				{
					collection.find({$or:saveArray}).toArray(function(err, docs){
						db.close();
						search.setVersion(docs, 0, function(saves) {
							callback_(saves);
						});
					});
				}
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

module.exports.deleteDBInfo = deleteDBInfo;
module.exports.getDBInfo = getDBInfo;
module.exports.changeDBInfo = changeDBInfo;
module.exports.getSavesFromList = getSavesFromList;
