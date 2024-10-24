// app.js
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyparser = require("body-parser");

// Create Express app
const app = express();

// Check if FRONTEND_URL is set
if (!process.env.FRONTEND_URL) {
    console.error("FRONTEND_URL is not defined in the environment variables.");
    process.exit(1);
}

// Middleware setup
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true // Allow credentials (cookies, etc.)
}));
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

// Routes setup
const user = require('./routes/userRoutes');
app.use("/api/v1", user);

// Enable preflight for all routes
app.options('*', cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

module.exports = app;
