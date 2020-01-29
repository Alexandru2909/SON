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
                'friends':[],
                'lastfm_id':'0',
                'lastfm_username': "",
                'vk_username':'',
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
                return true;
            case 'vk':
                initialObj.users[user].vk_username= name;
                return true;
            default:
                return false;
        }

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
    toggleLink:function(jsonData, user_email, sn, user_id){
        for(var user in jsonData.users){
            if((jsonData.users[user].email == user_email)){
                jsonData.users[user].lastfm_id = user_id;
                break;
            }
        }

        fs.writeFile('database.json', JSON.stringify(jsonData),(err)=>{
            if (err) throw err;
        });
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
    addFriend:function(jsonData, addToEmail, acqID, sn){
        let found = false;
        if(sn == "lastfm"){
            for(var user in jsonData.users){
                if(jsonData.users[user].email == addToEmail){
                    for(var friend in jsonData.users){
                        if(jsonData.users[friend].lastfm_id == acqID){
                            for(var sn in jsonData.users[user].friends){
                                if(jsonData.users[user].friends.sn == "lastfm"){
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
            fs.writeFile('database.json', JSON.stringify(jsonData), (err)=>{
                if (err) throw err;
            })
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
            fs.writeFile('database.json', JSON.stringify(jsonData), (err)=>{
                if (err) throw err;
            })
        }
    }
};