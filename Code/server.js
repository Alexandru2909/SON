var express = require('express');
var app = express();
var session = require('express-session')
var fs = require('fs');
var request = require('request');
var LastfmAPI = require("lastfmapi");
const vk_api = require('vk-io');
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
        case 'insertUserName':
            var ret = tools.putuser(jsonData,req.body.sn,req.session.email,req.body.user);
            switch(req.body.sn){
                case 'lastfm':
                    req.session.lastfm_user = req.body.user;
                    res.send(ret);
                    var username = req.session.lastfm_user;
                    lfm.user.getFriends({
                        'user':username
                    }, function(err, friends){
                        if(err){
                            throw err;
                        }
                        tools.addFriend(jsonData, req.session.email, friends, "lastfm");
                    });
                    break;
                case 'vk':
                    req.session.vk_user = req.body.user;
                    res.send(ret);
            }
           

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
        case 'insertTwitterFriends':
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    var username = jsonData.users[user].twitter_username;

                    clientTwitter.get("friends/list", { count: 100, screen_name: username, skip_status: "true" }, function(err, res) {
                        var friends = JSON.parse(JSON.stringify(res))["users"]
                        console.log(friends);
                        tools.addFriend(jsonData, req.session.email, friends, "twitter");
                    });
                }
            }
        case 'addVKToken':
            const vk = new vk_api.VK({
                token: req.body.token
            });
             
            async function run() {
                const response = await vk.api.friends.get({
                    owner_id: 580684984,
                    fields:['nickname','country','city','photo_100']
                });
                return response;
            };
            run().then((data)=>{
                var ret = tools.addFriend(jsonData,req.session.email,data.items,'vk');
            });
            res.send(ret);
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
                request.post("https://api.twitter.com/oauth/access_token?oauth_token=" + req.body.user_token + "&oauth_verifier=" + req.body.verifier, function(err, res, body){
                    var string = res.body.split("&")
                    for (var i = 0; i < string.length; i++) {
                        string[i] = string[i].split("=")
                    }
                    var screen_name = string[3][1];
                    for(user in jsonData.users){
                        if(jsonData.users[user].email == req.session.email){
                            jsonData.users[user].twitter_linked = true;
                            jsonData.users[user].twitter_username = screen_name;
                            fs.writeFile('database.json', JSON.stringify(jsonData), (err) => {
                                if(err){ throw err;}
                            })
                            break;
                        }
                    }
                });
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

        case 'addAcq':
            var acqList = []
            for(u in jsonData.users){
                if(jsonData.users[u].email == req.session.email){
                    var user = jsonData.users[u];
                    for(fr in user.friends){
                        for(acq in user.friends){
                            if(user.friends[acq].sn != user.friends[fr].sn){
                                console.log(user.friends[fr].sn, user.friends[acq].sn);
                                for(f in user.friends[fr].friends){
                                    // console.log(user.friends[fr].friends[f].name);
                                    // console.log("____");
                                    var found = false
                                    for(a in user.friends[acq].friends){
                                        if(user.friends[fr].friends[f].real_name){
                                            if(tools.getRealName(user.friends[acq].friends[a].real_name).localeCompare(tools.getRealName(user.friends[fr].friends[f].real_name)) == 0){
                                                found = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(found == false){
                                        var ret = tools.lookUpUser(jsonData, user.friends[fr].friends[f].name, user.friends[fr].sn, user.friends[acq].sn);
                                        if(ret){
                                            var obj = {
                                                "acq" : ret[0],
                                                "alsoOn" : ret[1]
                                            }
                                            acqList.push(obj);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    jsonData.users[u].acquaintances = acqList;
                    console.log(acqList);
                    fs.writeFile('database.json',JSON.stringify(jsonData),(err)=>{
                        if ( err) throw err;
                    });
                }
            }

            break;
        case 'getAcqList':
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    res.send({"response" : jsonData.users[user].acquaintances});
                }
            }
            break;
        case 'getMatchingFriends':
            var matching_friends = [];
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    for(f1 in jsonData.users[user].friends){
                        for(f2 in jsonData.users[user].friends[f1].friends){
                            var searchIn1 = jsonData.users[user].friends[f1].friends[f2].name.replace(/\s/g, "").toLowerCase();
                            var searchIn2 = jsonData.users[user].friends[f1].friends[f2].real_name.replace(/\s/g, "").toLowerCase();
                            if(searchIn1.includes(req.body.words) == true){
                                matching_friends.push(jsonData.users[user].friends[f1].friends[f2]);
                            } else if(searchIn2.includes(req.body.words) == true){
                                matching_friends.push(jsonData.users[user].friends[f1].friends[f2]);
                            }
                        }
                    }
                }
            }
            res.send({'response': matching_friends});
            break;
        case 'downloadGraph':
            
            break;
        case 'vkOut':
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    jsonData.users[user].vk_username = "";
                    jsonData.users[user].vk_linked = false;
                    for(f in jsonData.users[user].friends){
                        if(jsonData.users[user].friends[f].sn == "vk"){
                            jsonData.users[user].friends[f].friends = [];
                            break;
                        }
                    }
                    break;
                }
            }
            fs.writeFile('database.json',JSON.stringify(jsonData),(err)=>{
                if ( err) throw err;
            });
            res.send(true);
            break;
        case 'lastfmOut':
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    jsonData.users[user].lastfm_username = "";
                    jsonData.users[user].lastfm_linked = false;
                    for(f in jsonData.users[user].friends){
                        if(jsonData.users[user].friends[f].sn == "lastfm"){
                            jsonData.users[user].friends[f].friends = [];
                            break;
                        }
                    }
                    break;
                }
            }
            fs.writeFile('database.json',JSON.stringify(jsonData),(err)=>{
                if ( err) throw err;
            });
            res.send(true);
            break;
        case 'twitterOut':
            for(user in jsonData.users){
                if(jsonData.users[user].email == req.session.email){
                    jsonData.users[user].twitter_username = "";
                    jsonData.users[user].twitter_linked = false;
                    for(f in jsonData.users[user].friends){
                        if(jsonData.users[user].friends[f].sn == "twitter"){
                            jsonData.users[user].friends[f].friends = [];
                            break;
                        }
                    }
                    break;
                }
            }
            fs.writeFile('database.json',JSON.stringify(jsonData),(err)=>{
                if ( err) throw err;
            });
            res.send(true);
            break;
        default:
            console.log('nothing');
    }
})

app.listen(3000);
console.log('listening to 3000...');