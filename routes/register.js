var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var database = require('../database.js');
var md5 = require('md5');

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/tpt';

function checkUsername(userName, callback_) 
{
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			var collection = db.collection('User');
			collection.find({'Name':userName}).toArray(function(err, docs) {
				if(docs.length > 0)
					callback_(false);
				else
					callback_(true);
			});
		}
	});
}

function createAccount(inputData, callback_)
{
	database.checkLastID(function(data) {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				db.collection('Info').update({'LastUserID':parseInt(data.User)}, {$set: {'LastUserID':parseInt(data.User)+1}});
				
				db.collection("User", function(error, collection) {
					collection.insert({
						Biography: inputData.biography,
						Hash: md5(inputData.displayName + '-' + md5(inputData.password)),
						ID: parseInt(data.User)+1,
						Location: inputData.location,
						Name: inputData.displayName
					}, function() {
						db.close();
						callback_(parseInt(data.User)+1);
					});
				});
			}
		});
	});
}

router.get('/', function(req, res, next) {
	if (req.cookies !== undefined && req.cookies.remember)
		authorized = false; //
	else
		authorized = false; 
	
	res.render('register', { title: 'Register' });
});


/*
{ firstName: 'asdas',
  lastName: 'assadas',
  displayName: 'ada',
  age: '18',
  location: 'asdsa',
  biography: 'asdas',
  password: 'ace',
  passwordConfirmation: 'ace' }
*/

router.post('/', function(req, res, next) {
	formData = {firstName:null, lastName:null, displayName:null, age:null, location:null, biography:null, password:null, passwordConfirmation:null};
	
	for(var place in req.body)
		formData[place] = req.body[place];
	
	if(formData.password === "" || formData.passwordConfirmation === "" || formData.age === "" || formData.displayName === "" || formData.lastName === "") {
		error = "Mandatory fields were not filled out"
		authorized = false;
		res.render('register', { title: 'Register' });
	} else if(formData.password != formData.passwordConfirmation) {
		error = "Those passwords do not match"
		authorized = false;
		res.render('register', { title: 'Register' });
	} else if(formData.password.length < 6) {
		error = "That password is too short. Password length must be at least 6 chars"
		authorized = false;
		res.render('register', { title: 'Register' });
	} else if(parseInt(formData.age) % 1 !== 0) {
		error = "Please input a number as your age"
		authorized = false;
		res.render('register', { title: 'Register' });
	} else if(formData.password.replace(/\s/g, "") == "") {
		error = "Your password cannot only be whitespace"
		authorized = false;
		res.render('register', { title: 'Register' });
	} else {
		authorized = true;
		
		checkUsername(formData.displayName, function(data) {
			if(data) {
				var time = new Date() - 1;
				createAccount(formData, function(id) {
					recentID = id;
					res.cookie('remember', 1, {maxAge: time});
					res.render('register', { title: 'Register' });
				});
			} else {
				authorized = false;
				error = "That display name has already been taken";
				res.render('register', { title: 'Register' });
			}
		});
	}
});

module.exports = router;
