var express = require('express');
var app = express();
const path = require('path');
app.use(express.static(__dirname + '/views/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/views/partials/index.html'));
});
// app.get('/links', function(req, res) {
//     res.render('partials/index',{
//         page: 'links'
//     });
// });
// app.get('/acquaintances', function(req, res) {
//     res.render('partials/index',{
//         page: 'acquaintances'
//     });
// });
// app.get('/friends', function(req, res) {
//     res.render('partials/index',{
//         page: 'friends'
//     });
// });

// app.get('/signup', function(req, res){
//     res.render('partials/index', {
//         page: 'signup'
//     });
// });

app.listen(3000);
console.log('listening to 3000...');