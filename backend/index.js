const express = require('express');
const cors =  require("cors")
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const app = require("./app.js");

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Uncaught Exception");
    process.exit(1);

})


dotenv.config({path:"./config/config.env"});
connectDatabase()


const PORT = process.env.PORT||8080;

const server = app.listen(PORT,()=>{
    console.log(`Server is running on PORT: ${PORT} `);
})


process.on("unhandledRejection",err=>{
    console.log(`Error:${err.message}`)
    console.log("Shutting down the server due to unhandled Promise Rejection");
    server.close(()=>{
        process.exit(1);
    })
})
