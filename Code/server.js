var express = require('express');
var app = express();
var session = require('express-session')
var fs = require('fs');
var LastfmAPI = require("lastfmapi");
var lfm = new LastfmAPI({
	'api_key' : 'a0a04802c25d3f828bf43e8c54e50ed8',
	'secret' : '6279eb4e0d1b8ea831df19ddbee77ef2'
});
let jsonData = require('./database.json');
var tools = require('./main.js');

app.use(express.static(__dirname + '/views/public'));
app.use(session({secret: 'thisismysecret'}));
// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

app.get('/',tools.checkAuth, function(req, res) {
    res.render('partials/index',{
        page: 'none'
    });
});
app.get('/links',tools.checkAuth, function(req, res) {
    res.render('partials/index',{
        page: 'links'
    });
});
app.get('/acquaintances',tools.checkAuth, function(req, res) {
    res.render('partials/index',{
        page: 'acquaintances'
    });
});
app.get('/friends',tools.checkAuth, function(req, res) {
    res.render('partials/index',{
        page: 'friends'
    });
});

app.get('/signup', function(req, res){
    res.render('partials/sign_up');
});

app.get('/login', function(req, res){
    res.render('partials/login');
});

//to parse arguments coming from json
app.use(express.json());

app.post('/functions',(req,res) => {
    console.log('Processing ' + req.body.func + '...');
    console.log(jsonData);
    switch(req.body.func){
        case 'getFriends':
            var list = tools.getFriends(jsonData, req.session.email, req.body.network);
            res.send({'response': list});
            break;
        case 'getFriendsBody':
            var cnt = String(fs.readFileSync(__dirname + '/views/partials/body_fri.ejs','utf8'));
            res.send({'response': cnt});
            break;
        case 'getAcqBody':
            var cnt = String(fs.readFileSync(__dirname + '/views/partials/body_acq.ejs','utf8'));
            res.send({'response': cnt});
            break;
        case 'getLinksBody':
            var cnt = String(fs.readFileSync(__dirname + '/views/partials/body_lin.ejs','utf8'));
            res.send({'response': cnt});
            break;
        case 'adduserToDB':
            var ret = tools.adduser(jsonData,req.body.fname,req.body.lname,req.body.email,req.body.phone,req.body.pass);
            if (ret == true){
                req.session.email = req.body.email;
                let x = JSON.stringify(jsonData);
                fs.writeFile('database.json',x,(err)=>{
                    if ( err) throw err;
                });
            }
            res.send(ret);
            break;
        case 'checkUser':
            var ret = tools.checkUser(jsonData,req.body.email,req.body.pass);
            if (ret == true){
                req.session.email = req.body.email;
            }
            res.send(ret);
            break;
        case 'toggleLink':
            var ret = tools.toggleLink(jsonData, req.session.email, req.body.sn, req.body.user_token);
            if(ret == true){
                req.session.lastfm_toggle = true;
                req.session.lastfm_token = req.body.user_token;
            }
            res.send(ret);
            break;
        case 'upgradeLinks':
            var listOfSN = [];
            if(req.session.lastfm_toggle == true)
                listOfSN.push("lastfm");
            if(req.session.twitter_toggle == true)
                listOfSN.push("twitter");
            res.send(listOfSN);
        case 'getAcq':
            var username = "";
            lfm.user.getInfo({}, 
                function (err, user_info){
                    if(err){
                        throw err;
                    }
                    username = user_info.name;
                }
                )
            lfm.user.getFriends({
                'user': username
            }, function(err, friends){
                if(err){
                    throw err;
                }
                let users_list = [];
                for(var user in jsonData.users){
                    users_list.push(jsonData.users[user].lastfm_id);
                }
                for(var user in friends.friends){
                    if(users_list.includes(friends.friends[user].id)){
                        if(!tools.isFriend(jsonData, req.session.email, friends.friends[user].id, "lastfm"))
                        tools.addAcq(jsonData, req.session.email, friends.friends[user].id, "lastfm");
                    }
                }
            });
        default:
            console.log('nothing');
    }
})

app.listen(3000);
console.log('listening to 3000...');