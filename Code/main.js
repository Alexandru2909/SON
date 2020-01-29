fs = require("fs");

module.exports = {
    adduser:function(initialObj,fname,lname,email,phone,psw){
        for ( var user in initialObj.users){
            if(initialObj.users[user].email === email)
                return false;
        }
        let obj = {"email":email,
                'fname':fname,
                'lname':lname,
                'phone':phone,
                'pass':psw,
                'acquaintances':[],
                'friends':[{
                    'sn': "lastfm",
                    'friends' : []
                },
                {
                    'sn': "twitter",
                    'friends' : []
                },
                {
                    'sn': "vk",
                    'friends' : []
                }],
                'lastfm_id':'0',
                'lastfm_username': "",
                'twitter_username': "",
                'vk_id':'',
                'lastfm_linked': false,
                'twitter_linked': false,
                'vk_linked' : false,
                'date':Date.now()};
        console.log(initialObj);
        initialObj.users.push(obj);
        return true;
    },
    putuser:function(initialObj,network,email,name){
        var x = 0;
        for ( var user in initialObj.users){
            if(initialObj.users[user].email === email)
                x=user
        }
        switch(network){
            case 'lastfm':
                initialObj.users[x].lastfm_username=name;
                break;
            case 'vk':
                initialObj.users[user].vk_username= name;
                break;
            default:
                break;
        }
        var x = JSON.stringify(initialObj);
        fs.writeFile('database.json',x,(err)=>{
            if ( err) throw err;
        });
        return true;
    },
    getFriends:function(initialObj,email,network){
        for ( var user in initialObj.users){
            if(initialObj.users[user].email === email){
                for ( var net in initialObj.users[user].friends ){
                    if(initialObj.users[user].friends[net].sn === network)
                        return initialObj.users[user].friends[net].friends;
                }
            }
        }
        return null;
    },
    checkUser:function(initialObj,email,pass){
        for ( var user in initialObj.users){
            if(initialObj.users[user].email === email){
                if(initialObj.users[user].pass === pass)
                    return true;
                else
                    return false;
            }
        }
        return false;
    },
    checkAuth:function(req,res,next){
        if(!req.session.email){
            res.redirect('/signup');
        } else { 
            next();
        }
    },
    addAcq:function(jsonData, addToEmail, acqID, sn){
        let found = false;
        for(var user in jsonData){
            if (jsonData.users[user].email == addToEmail){
                for(var acq in jsonData.users[user].acquaintances){
                    if (acq.sn == sn){
                        acq.friends = acq.friends.push((acqID, Date.now()));
                        found = true;
                        break;
                    }
                }
            }
            if(found == true){
                break;
            }
        }

        fs.writeFile('database.json', JSON.stringify(jsonData), (err)=>{
            if (err) throw err;
        })
    },
    addFriend:function(jsonData, addToEmail, friends, sn){
        let new_friends_list = [];
        let found = false;
        console.log(friends)
        if(sn == "lastfm"){
            for(var user in jsonData.users){
                if(jsonData.users[user].email == addToEmail){
                    for(var net in jsonData.users[user].friends){
                        if(jsonData.users[user].friends[net].sn == sn){
                            for (var index in friends.user){
                                var obj = {
                                    'img' : friends.user[index].image[1]['#text'],
                                    'name' : friends.user[index].name,
                                    'real_name' : friends.user[index].realname,
                                    'country' : friends.user[index].country,
                                    'from' : "LastFM",
                                    'link' : 'https://www.last.fm/user/' + friends.user[index].name
                                }
                                console.log(obj);
                                new_friends_list.push(obj);
                            }
                        }
                        jsonData.users[user].friends[net].friends=new_friends_list;
                        var x = JSON.stringify(jsonData);
                        fs.writeFile('database.json',x,(err)=>{
                            if ( err) throw err;
                        });
                        return true;
                    }
                }
            }
        }


        if(sn == "twitter"){
            for(var user in jsonData.users){
                if(jsonData.users[user].email == addToEmail){
                    for(var net in jsonData.users[user].friends){
                        if(jsonData.users[user].friends[net].sn == sn){
                            for (var index in friends){
                                var obj = {
                                    'img' : "",
                                    'name' : friends[index].screen_name,
                                    'real_name' : friends[index].name,
                                    'country' : friends[index].location,
                                    'from' : "Twitter",
                                    'link' : 'https://twitter.com/' + friends[index].screen_name
                                };
                                console.log(obj);
                                new_friends_list.push(obj);
                            }
                            jsonData.users[user].friends[net].friends=new_friends_list;
                            var x = JSON.stringify(jsonData);
                            fs.writeFile('database.json',x,(err)=>{
                                if ( err) throw err;
                            });
                            return true;
                        }
                    }
                }
            }
        }


        if(sn == "twitter"){
            for(var user in jsonData.users){
                if(jsonData.users[user].email == addToEmail){
                    for(var friend in jsonData.users){
                        if(jsonData.users[friend].twitter_id == acqID){
                            for(var sn in jsonData.users[user].friends){
                                if(jsonData.users[user].friends.sn == "twitter"){
                                    if(!jsonData.users[user].friends.friends.includes(jsonData.users[friend].email)){
                                        jsonData.users[user].friends.friends = jsonData.users[user].friends.friends.push(jsonData.users[friend].email);
                                    }
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if(found == true){
                            break;
                        }
                    }
                }
                if(found == true){
                    break;
                }
            }

        }
    },
    getRealName:function(real_name){
        ret_name = real_name
        ret_name = ret_name.replace(/\s/g, "");
        ret_name = ret_name.toLowerCase();
        return ret_name;
    },

    lookUpUser:function(jsonData, nickname, fromSN, searchInSN){
        var ret_user = [];
        for(user in jsonData.users){
            if(fromSN == "lastfm"){
                if(searchInSN == "twitter"){
                    if(jsonData.users[user].lastfm_username == nickname){
                        if(jsonData.users[user].twitter_username){
                            ret_user.push(jsonData.users[user]);
                            ret_user.push("twitter");
                            return ret_user;
                        }
                    }
                }
                if(searchInSN == "vk"){
                    if(jsonData.users[user].lastfm_username == nickname){
                        if(jsonData.users[user].vk_username) {
                            ret_user.push(jsonData.users[user]);
                            ret_user.push("vk");
                            return ret_user;
                        }
                    }
                }
            }
            if(fromSN == "twitter"){
                if(searchInSN == "lastfm"){
                    if(jsonData.users[user].twitter_username == nickname){
                        if(jsonData.users[user].lastfm_username){
                            ret_user.push(jsonData.users[user]);
                            ret_user.push("lastfm");
                            return ret_user;
                        }
                    }
                }
                if(searchInSN == "vk"){
                    if(jsonData.users[user].twitter_username == nickname){
                        if(jsonData.users[user].vk_username) {
                            ret_user.push(jsonData.users[user]);
                            ret_user.push("vk");
                            return ret_user;
                        }
                    }
                }
            }
            if(fromSN == "vk"){
                if(searchInSN == "twitter"){
                    if(jsonData.users[user].vk_username == nickname){
                        if(jsonData.users[user].twitter_username){
                            ret_user.push(jsonData.users[user]);
                            ret_user.push("twitter");
                            return ret_user;
                        }
                    }
                }
                if(searchInSN == "lastfm"){
                    if(jsonData.users[user].vk_username == nickname){
                        if(jsonData.users[user].lastfm_username) {
                            ret_user.push(jsonData.users[user]);
                            ret_user.push("lastfm");
                            return ret_user;
                        }
                    }
                }
            }
        }
    }
};