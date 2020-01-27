module.exports = {
    adduser:function(initialObj,fname,lname,email,phone,psw){
        for ( var user in jsonData.users){
            if(user.email === email)
                return false;
        }
        let obj = {"email":email,
                'fname':fname,
                'lname':lname,
                'phone':phone,
                'pass':psw,
                'acquaintances':[],
                'friends':[],
                'date':Date.now()};
        console.log(initialObj);
        initialObj.users.push(obj);
        return true;
    }
};