const dotenv = require("dotenv");

// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: "./config.env" });
}

const connectDatabase = require("./database");
const app = require("./app");
const { server, io } = require("./socket/index");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error("Shutting down the server due to Uncaught Exception");
    process.exit(1);
});

// Connect to the database
connectDatabase();

// Define a simple health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
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

// For Vercel serverless functions
module.exports = server;