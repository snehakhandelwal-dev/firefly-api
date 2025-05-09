const mongoose = require('mongoose')
require('dotenv').config()
console.log(process.env.MONGODB_URL)
mongoose.connect(process.env.MONGODB_URL, {}).then(()=>{
    console.log(`MongoDB Connected`);
}).catch((err)=>{
    console.log("MongoDb Err : ",err?.message)
})
module.exports = mongoose;
