const dbconfig=require('../config/dbconfig.js');
const mongoose=require("mongoose");
mongoose.Promise=global.Promise;
const db={};
db.mongoose=mongoose;
db.url=dbconfig.url;

db.users=require('./user.model.js')(mongoose);

module.exports=db;