var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/tpt';

/* GET login page. */
router.get('/', function(req, res, next) {
	console.log(req.cookies);
	if (req.cookies !== undefined && req.cookies.remember)
		authorised = false; //
	else
		authorised = false; 
	
	res.render('register', { title: 'Express' });
});

router.post('/', function(req, res, next) {
	console.log(req.body);
	
	authorised = true;
	var time = new Date() - 1;
	
	res.cookie('remember', 1, {maxAge: time});
	res.render('register', { title: 'Express' });
});

module.exports = router;
