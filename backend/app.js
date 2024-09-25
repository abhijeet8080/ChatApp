const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyparser = require("body-parser");


app.use(express.json());
// app.use(cors({
//     origin:process.env.FRONTEND_URL,
//     credentials:true
// }))
app.use(cors());
app.use(cookieParser());
app.use(bodyparser.urlencoded({extended:true}));


const user = require('./routes/userRoutes');


app.use("/api/v1",user);


module.exports = app;