/*
 * Write your routing code in this file.  Make sure to add your name and
 * @oregonstate.edu email address below.
 *
 * Name: Ian Band
 * Email: bandi@oregonstate.edu
 */

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var fs = require("fs");
var port = process.env.PORT || 3000;
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var mongoURL = 'mongodb://goatlink:doctomoto@ds044667.mlab.com:44667/goatlink'
var mongoConnection = null;

app.use(bodyParser.json());
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//var postList = JSON.parse(fs.readFileSync('postData.json', 'utf8'));

//console.log(postList);


app.get('/p/:postTitle', function(req, res, next){
	var postDataCollection = mongoConnection.collection('posts');
	console.log('trying to get single post with the title: ' + req.params.postTitle);
	postDataCollection.find({title: req.params.postTitle}).toArray(function (err, results) {
		if (err) {
			res.status(500).send("Error fetching post from DB");
		}	
		else if(results[0]){
			res.status(200).render('postPage', results[0]);
		}
		else{
			next();
		}
	});
	
});

app.post('/p/:postTitle/upvote', function(req, res, next) {
	//access post in database and incrament
	var postDataCollection = mongoConnection.collection('posts');
	postDataCollection.update({title: req.params.postTitle}, {$inc: { score: 1}}, function (err, result){
		if(err){
			res.status(500).send("Error updating post in database");
		}
		else{
			res.status(200).send('post upvoted successfully!');
		}
	});
});

app.post('/p/:postTitle/downvote', function(req, res, next) {
	//access post in database and dec
	var postDataCollection = mongoConnection.collection('posts');
	postDataCollection.update({title: req.params.postTitle}, {$inc: { score: -1}}, function (err, result){
		if(err){
			res.status(500).send("Error updating post in database");
		}
		else{
			res.status(200).send('post upvoted successfully!');
		}
	});
});




/**app.post('/posts/:postId/downvote', function(req, res, next) {
	//access :postId in database and decrament
	if(postList[postId]){
		var voteCount = postList[postId].score
		voteCount = voteCount - 1;
		postList[postId].score = voteCount;
		res.status(200).send("post downvoted successfullly!");
	}
	else{
		res.status(400).send("post not found");
	}
});**/


app.post('/newPost', function (req, res, next) {
	console.log('recieved a request to make a post!')
	console.log('req.body: ' + req.body);
	
	if (req.body && req.body.photoURL && req.body.title) {
		
		console.log('length of post title: ' + req.body.title.length)
		var postDataCollection = mongoConnection.collection('posts');
		//console.log('number of matching titles: ' + postDataCollection.count({title: req.body.title}));
	
		if(req.body.title.length > 5 || req.body.title.length < 1){ //check that the title is between 1 and 5 characters
			res.status(400).send("title must be between 1 and 5 characters");
			console.log('requested post title was not between 1 and 5 characters');
		}
		/*else if(postDataCollection.count({title: req.body.title}) >= 1 ){//check to see if post with same title already exists in DB
			res.status(400).send("A post already exists with that title!");
			console.log('requested post title already exists in db');
		}*/
		else{
			console.log('the requested post is valid... attempting to put in database');
			var newPostObj = {	//create new post object with a score of 1
				score: 1,
				photoURL: req.body.photoURL,
				description: req.body.description,
				title: req.body.title
			}
			postDataCollection.count({title: req.body.title}, function(err, result){
				if(err){
					res.status(500).send("Error searching database");
				}
				else if(result >= 1){//title already exists in db
					res.status(400).send("There is already a post with that title!");
				}
				else{
					postDataCollection.insert(newPostObj, function (err, result) {//insert new post object into db
						if (err) {
							res.status(500).send("Error inserting post into DB");
							console.log("Error inserting post into DB");
						}
						else {
							res.status(200).send("post successful");
							console.log('post successful');
						}
					});
				}
			});
			
			
			
		}
	}
	else{
		console.log('post request had one or more invalid elements');
		if(!req.body){
			console.log('req.body does not exist...');
		}
		//console.log('url: ' + req.body.photoURL);
		//console.log('title: ' + req.body.title);
		
		res.status(400).send("Request body needs a `photoURL` and `title` field.");
	}
	
});



app.get('/', function(req, res){
	var postDataCollection = mongoConnection.collection('posts');
	//console.log(postDataCollection);
	postDataCollection.find({}).toArray(function (err, results) {
    if (err) {
		res.status(500).send("Error fetching people from DB");
    } else {
		res.status(200).render('homePage.handlebars', { 'posts': results });
	}
	
	});
});

app.use(express.static('public'));

app.use('*', function (req, res) {
  //res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  res.status(404).render('404');
});

MongoClient.connect(mongoURL, function (err, connection) {
  if (err) {
    throw err;
  }
  mongoConnection = connection;
  //mongoConnection.grantRolesToUser("goatlink", [{role: "read", db: "goatlink"}]);
  app.listen(port, function () {
    console.log("== Server listening on port:", port);
  });
});


