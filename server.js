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

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


var postList = JSON.parse(fs.readFileSync('postData.json', 'utf8'));

console.log(postList);
app.get('/', function(req, res){
	res.status(200).render('homePage.handlebars', { 'posts': postList });
});
app.get('/posts/:postId', function(req, res, next){
	var postId = req.params.postId;
	if(postList[postId]){
		res.status(200).render('postPage.handlebars', postList[postId]);
	}
	else{
		next();
	}
	
});

app.use(express.static('public'));

app.use('*', function (req, res) {
  //res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  res.status(404).render('404');
});



app.listen(port, /*'0.0.0.0',*/ function () {
  console.log("== Server is listening on port", port);
});
