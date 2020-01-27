// var mongoCl = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/sondb";

// mongoCl.connect(url,function(err,db){
//     if (err) throw err;
//     console.log("Database created!");
//     var dbo = db.db("SONdb");
//     dbo.createCollection("users",function(err,res){
//         if(err) throw err;
//         console.log("Users collection created.");
//         db.close();
//     });
// });

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});