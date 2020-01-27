var express = require('express');
var app = express();
var fs = require('fs');
app.use(express.static(__dirname + '/views/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

app.get('/', function(req, res) {
    res.render('partials/index',{
        page: 'none'
    });
});
app.get('/links', function(req, res) {
    res.render('partials/index',{
        page: 'links'
    });
});
app.get('/acquaintances', function(req, res) {
    res.render('partials/index',{
        page: 'acquaintances'
    });
});
app.get('/friends', function(req, res) {
    res.render('partials/index',{
        page: 'friends'
    });
});

app.get('/signup', function(req, res){
    res.render('partials/sign_up');
});

app.post('/getFriends', (req, res) => {
    var cnt = String(fs.readFileSync(__dirname + '/views/partials/body_fri.ejs','utf8'));
	res.send({'response': cnt});
});

app.post('/getAcq', (req, res) => {
    var cnt = String(fs.readFileSync(__dirname + '/views/partials/body_acq.ejs','utf8'));
	res.send({'response': cnt});
});

app.post('/getLinks', (req, res) => {
    var cnt = String(fs.readFileSync(__dirname + '/views/partials/body_lin.ejs','utf8'));
	res.send({'response': cnt});
});

app.listen(3000);
console.log('listening to 3000...');