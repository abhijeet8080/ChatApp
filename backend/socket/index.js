// socket/index.js
const { Server } = require('socket.io');
const http = require("http");
const app = require("../app"); // Import the app from app.js
const { getUserDetailsFromToken } = require('../middleware/auth');
const User = require("../models/UserModel");

// Create HTTP server using the existing app
const server = http.createServer(app);

// Set up Socket.IO server with CORS options
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, // Ensure this matches the CORS origin
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Online users tracked using a Set for efficient lookup
const onlineUser = new Set();

// Handle socket connection
io.on('connection', async (socket) => {
    console.log('Connected user:', socket.id);
    
    // Retrieve token from socket handshake
    const token = socket.handshake.auth.token;
    
    // Get user details from token
    const user = await getUserDetailsFromToken(token);

    if (!user) {
        console.log('Invalid token. Disconnecting socket:', socket.id);
        socket.disconnect(true);
        return;
    }

    // Join the user to a room identified by their user ID
    socket.join(user._id.toString());

    // Add the user to the online users Set
    onlineUser.add(user._id.toString());

    // Emit the updated list of online users to all connected clients
    io.emit('onlineUser', Array.from(onlineUser));

    // Handle 'message-page' event
    socket.on('message-page', async (userId) => {
        console.log('Received userId for message-page:', userId);

        try {
            // Ensure userId is a string
            const targetUserId = userId.toString();

            // Fetch user details of the target user
            const userDetails = await User.findById(targetUserId).select("-password");

            if (!userDetails) {
                console.log(`User with ID ${targetUserId} not found.`);
                socket.emit('message-page', { error: 'User not found.' });
                return;
            }

            // Prepare the payload
            const payload = {
                _id: userDetails?._id,
                name: userDetails?.name,
                email: userDetails?.email,
                // Check if the target user is online
                profile_pic:userDetails?.profile_pic,
                online: onlineUser.has(targetUserId)
            };
            console.log("payload",payload)
            // Emit the payload back to the requesting socket
            socket.emit('message-user', payload);
        } catch (error) {
            console.error('Error handling message-page event:', error);
            socket.emit('message-page', { error: 'An error occurred.' });
        }
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
        if (user && user._id) {
            onlineUser.delete(user._id.toString());
            console.log('Disconnected user:', socket.id);

            // Emit the updated list of online users to all connected clients
            io.emit('onlineUser', Array.from(onlineUser));
        }
    });
});

// Export the io and server instances
module.exports = { io, server };
