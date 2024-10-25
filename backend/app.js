const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyparser = require("body-parser");

// Create Express app
const app = express();

// Define allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://chat-app-frontend-eta-fawn.vercel.app"
];

// Configure CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600 // Cache preflight requests for 10 minutes
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

// Enable preflight for all routes
app.options('*', cors(corsOptions));

// Routes setup
const user = require('./routes/userRoutes');
app.use("/api/v1", user);

module.exports = app;