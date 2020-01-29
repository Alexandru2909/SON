var express = require('express');
var app = express();
var session = require('express-session')
var fs = require('fs');
var request = require('request');
var LastfmAPI = require("lastfmapi");
var lfm = new LastfmAPI({
	'api_key' : 'a0a04802c25d3f828bf43e8c54e50ed8',
	'secret' : '6279eb4e0d1b8ea831df19ddbee77ef2'
});
var Twitter = require("twitter");
var clientTwitter = new Twitter({
    consumer_key : "XGy6COOt115UfbvCC8jvmf0Ng",
    consumer_secret : "raotGUduELFwJcdmE2c7BXrvR39jA9AHVOYeIlZtqpalDCtcLB",
    access_token_key: "1178909523689578497-L3NV0l1GFLd0PLo8JfuwYZEgKxamXp",
    access_token_secret: "Edw5MeJ8A14SrtWm9hY4dCiE8fFA1cPQECHOsQ57q3XY6"

});
let jsonData = require('./database.json');
var tools = require('./main.js');
const fetch = require('node-fetch');
const crypto = require('crypto');



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
    // console.log(jsonData);
    switch(req.body.func){
        case 'getFriends1':
            
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
        case 'insertLFMuser':
            var ret = tools.putuser(jsonData,'lastfm',req.session.email,req.body.user);
            req.session.lastfm_user = req.body.user;
            res.send(ret);
            var username = req.session.lastfm_user;
            console.log(username);
            lfm.user.getFriends({
                'user':username
            }, function(err, friends){
                if(err){
                    throw err;
                }
                tools.addFriend(jsonData, req.session.email, friends, "lastfm");
            });

            // clientTwitter.get('friends/list', function(err, data){
            //     if(err){
            //         throw err;
            //     }

            //     for(var user in data.users){
            //         tools.addFriend(jsonData, req.session.email, data.users[user].id, "twitter");
            //     }
            // });

            break;
        case 'requestTokenTwitter':    
            clientTwitter.post("https://api.twitter.com/oauth/request_token", { oauth_callback: "http://www.localhost:3000/links?sn=twitter" }, function(err, response) {
                var string = response.split("&")
                for (var i = 0; i < string.length; i++) {
                    string[i] = string[i].split("=")
                }
                console.log(string);
                if (string[2][1] == "true") {
                    var oauth_token = string[0][1]
                    var oauth_token_secret = string[1][1]
                }
                res.send({token: oauth_token, secret: oauth_token_secret});
            })
            break;
        case 'toggleLink':     
            if(req.body.social_network == "lastfm"){
                for(user in jsonData.users){
                    if(jsonData.users[user].email == req.session.email){
                        jsonData.users[user].lastfm_linked = true
                        fs.writeFile('database.json', JSON.stringify(jsonData), (err) => {
                            if(err){ throw err;}
                        })
                    }
                }
            }
            if(req.body.social_network == "twitter"){
                for(user in jsonData.users){
                    if(jsonData.users[user].email == req.session.email){
                        jsonData.users[user].twitter_linked = true
                        fs.writeFile('database.json', JSON.stringify(jsonData), (err) => {
                            if(err){ throw err;}
                        })
                    }
                }
            }

            res.send(true);
            break;
        case 'updateLinks':
            var listOfSN = [];
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    if(jsonData.users[user].lastfm_linked == true){
                    listOfSN.push("lastfm");
                    }
                    if(jsonData.users[user].twitter_linked == true){
                        listOfSN.push("twitter");
                    }
                    if(jsonData.users[user].vk_linked == true){
                        listOfSN.push("vk");
                    }
                }
            }

            res.send({list:listOfSN});
            break;
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

        case 'getFriends':


            break;
        default:
            console.log('nothing');
    }
})

app.listen(3000);
console.log('listening to 3000...');