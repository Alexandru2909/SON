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
                'lastfm': "false",
                'date':Date.now()};
        console.log(initialObj);
        initialObj.users.push(obj);
        return true;
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
    toggleLink:function(jsonData, user_email, sn, user_token){
        for(var user in jsonData){
            if((jsonData.users[user].email == user_email)){
                jsonData.users[user].lastfm = "true";
                break;
            }
        }

        fs.writeFile('database.json',jsonData,(err)=>{
            if ( err) throw err;
        });
        console.log("am scris");
    }
};