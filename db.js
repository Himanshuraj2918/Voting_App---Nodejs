const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGO_URL
  )


const db = mongoose.connection;

db.on('connected',()=>{
    console.log("Database connected");
})

db.on('disconnected',()=>{
    console.log("Database Disconnected");
})

db.on('error',()=>{

    console.error("Error in connection");
})

module.exports = db;