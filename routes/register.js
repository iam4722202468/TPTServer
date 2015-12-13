var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var database = require('../database.js');
var md5 = require('md5');
var validator = require('validator');

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
						Name: inputData.displayName,
						Email: inputData.email,
						Age: parseInt(inputData.age), 			//I have found the secret to not aging
						Website: inputData.website,
						FirstName: inputData.firstName,
						LastName: inputData.lastName
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
		authorized = true; //
	else
		authorized = false; 
	
	res.render('register', { title: 'Register' });
});

router.post('/', function(req, res, next) {
	formData = {firstName:null, lastName:null, email:null, displayName:null, age:null, location:null, biography:null, password:null, passwordConfirmation:null};
	
	formDataLengthsMax = {firstName:40, lastName:40, email:100, website:200, displayName:30, age:2, location:33, biography:1000, password:30, passwordConfirmation:30};
	formDataLengthsMin = {firstName:3, lastName:3, email:5, website:0, displayName:3, age:0, location:0, biography:0, password:0, passwordConfirmation:0};
	
	isGood = true;
	authorized = false;
	
	for(var place in req.body) {
		formData[place] = req.body[place];
		if(validator.isAscii(formData[place]) == false && formData[place].length > 0 && isGood) {
			isGood = false;
			error = place + " field must be an ascii value";
			res.render('register', { title: 'Register' });
		}
		if((formData[place].length < formDataLengthsMin[place] || formData[place].length > formDataLengthsMax[place]) && isGood) {
			isGood = false;
			error = place + " field must be between " + formDataLengthsMin[place].toString() + " and " + formDataLengthsMax[place].toString() + " characters";
			res.render('register', { title: 'Register' });
		}
	}
	
	if(isGood) {
		if(formData.password === "" || formData.passwordConfirmation === "" || formData.email === "" || formData.age === "" || formData.displayName === "" || formData.lastName === "") {
			error = "Mandatory fields were not filled out"
			res.render('register', { title: 'Register' });
		} else if(validator.isEmail(formData.email) == false) {
			error = formData.email + " is not a valid email"
			res.render('register', { title: 'Register' });
		} else if(validator.isAlphanumeric(formData.displayName) == false) {
			error = "Display Name must be alphanumeric";
			res.render('register', { title: 'Register' });
		} else if(formData.password != formData.passwordConfirmation) {
			error = "Those passwords do not match"
			res.render('register', { title: 'Register' });
		} else if(formData.password.length < 6) {
			error = "That password is too short. Password length must be at least 6 chars"
			res.render('register', { title: 'Register' });
		} else if(parseInt(formData.age) % 1 !== 0) {
			error = "Please input a number as your age"
			res.render('register', { title: 'Register' });
		} else if(formData.password.replace(/\s/g, "") == "") {
			error = "Your password must contain at least one character that is not whitespace"
			res.render('register', { title: 'Register' });
		} else {
			checkUsername(formData.displayName, function(data) {
				if(data) {
					var time = new Date() - 1;
					createAccount(formData, function(id) {
						recentID = id;
						res.cookie('remember', 1, {maxAge: time});
						
						authorized = true;
						res.render('register', { title: 'Register' });
					});
				} else {
					error = "That display name has already been taken";
					res.render('register', { title: 'Register' });
				}
			});
		}
	}
});

module.exports = router;
