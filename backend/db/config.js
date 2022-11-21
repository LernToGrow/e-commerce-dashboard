const mongoose = require("mongoose");
const mongoURL ="mongodb+srv://root:root@cluster0.qryyjcm.mongodb.net/E-comm";
mongoose.connect(mongoURL , {useUnifiedTopology : true , useNewUrlParser : true});
var connection = mongoose.connection;
connection.on("error", ()=>{
    console.log("Mongo Db Connnection failed");
})
connection.on("connected", ()=>{
    console.log("Mongo Db Connnection Succesfully");
})
module.exports= mongoose;
