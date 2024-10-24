const dotenv = require("dotenv");

// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: "./config.env" });
}

const express = require('express');
const cors = require("cors");
const connectDatabase = require("./database");
const app = require("./app"); // Import the app from app.js
const { server, io } = require("./socket/index"); // Import the server and io from socket/index.js

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error("Shutting down the server due to Uncaught Exception");
    process.exit(1);
});

// Connect to the database
connectDatabase();

// Set up CORS middleware for Express app
app.use(cors({
    origin: process.env.FRONTEND_URL, // Frontend URL from environment variable
    credentials: true // Allow credentials (cookies, headers, etc.)
}));

// Define a simple root route
app.get("/", (req, res) => {
    res.send("Server is running...");
});

const PORT = process.env.PORT || 8080;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", err => {
    console.error(`Unhandled Rejection: ${err.message}`);
    console.error("Shutting down the server due to unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    });
});
