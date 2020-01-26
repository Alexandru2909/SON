var mongoCl = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

mongoCl.connect(url,function(err,db){
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("SONdb");
    dbo.createCollection("logins",function(err,res){
        if(err) throw err;
        console.log("I created the Son database");
        db.close();
    })
});

mongoCl.connect(url,function(err,db){
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("SONdb");
    dbo.createCollection("logins",function(err,res){
        if(err) throw err;
        console.log("I created the Son database");
        db.close();
    })
});