// socket/index.js
const { Server } = require('socket.io');
const http = require("http");
const app = require("../app"); // Import the app from app.js
const { getUserDetailsFromToken } = require('../middleware/auth');
const User = require("../models/UserModel");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");

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
    const userId = user._id.toString();
    socket.join(userId);

    // Add the user to the online users Set
    onlineUser.add(userId);

    // Emit the updated list of online users to all connected clients
    io.emit('onlineUser', Array.from(onlineUser));

    /**
     * Event: 'sidebar'
     * Description: Fetches all conversations for the current user to display in the sidebar.
     */
    socket.on('sidebar', async () => {
        try {
            // Fetch conversations where the user is either the sender or receiver
            const conversations = await Conversation.find({
                "$or": [
                    { sender: userId },
                    { receiver: userId }
                ]
            })
            .sort({ updatedAt: -1 }) // Sort conversations by most recent
            .populate({
                path: 'messages',
                options: { sort: { createdAt: 1 } } // Ensure messages are sorted by creation time
            })
            .populate('sender', 'name email profile_pic')
            .populate('receiver', 'name email profile_pic');


            // Map conversations to include other user details and unseen message count
            const mappedConversations = conversations.map(conv => {
                // Determine the other user in the conversation
                const otherUser = conv.sender._id.toString() === userId ? conv.receiver : conv.sender;

                // Count unseen messages
                const countUnseenMsg = conv.messages.reduce((prev, curr) => prev + (!curr.seen ? 1 : 0), 0);

                // Get the last message
                const lastMsg = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;

                return {
                    _id: conv._id,
                    userDetails: otherUser,
                    unSeenMsg: countUnseenMsg,
                    lastMsg: lastMsg
                };
            });


            // Emit the conversations back to the requesting socket
            socket.emit('conversation', mappedConversations);
        } catch (error) {
            console.error('Error fetching conversations for sidebar:', error);
            socket.emit('conversation', { error: 'Failed to retrieve conversations.' });
        }
    });

    /**
     * Event: 'message-page'
     * Description: Fetches user details and conversation for the message page.
     */
    socket.on('message-page', async (userIdToMessage) => {

        try {
            // Ensure userId is a string
            const targetUserId = userIdToMessage?.toString();

            // Fetch user details of the target user
            const userDetails = await User.findById(targetUserId).select("-password");

            if (!userDetails) {
                socket.emit('message-page', { error: 'User not found.' });
                return;
            }

            // Check if a conversation exists between the current user and target user
            let conversation = await Conversation.findOne({
                '$or': [
                    { sender: user._id, receiver: targetUserId },
                    { sender: targetUserId, receiver: user._id }
                ]
            }).populate({
                path: 'messages',
                options: { sort: { createdAt: 1 } } // Ensure messages are sorted by creation time
            });

            if (!conversation) {
                conversation = null; // No conversation exists
            }

            // Prepare the payload with user details and conversation
            const payload = {
                user: {
                    _id: userDetails._id,
                    name: userDetails.name,
                    email: userDetails.email,
                    profile_pic: userDetails.profile_pic,
                    online: onlineUser.has(targetUserId)
                },
                conversation: conversation
            };

            // Emit the payload back to the requesting socket
            socket.emit('message-page-data', payload);
        } catch (error) {
            console.error('Error handling message-page event:', error);
            socket.emit('message-page', { error: 'An error occurred.' });
        }
    });

    /**
     * Event: 'new-message'
     * Description: Handles sending a new message between users.
     */
    socket.on('new-message', async (data) => {
        try {
            const { sender, receiver, text, imageUrl, videoUrl, msgByUserId } = data;
    
            // Ensure sender and receiver IDs are strings
            const senderId = sender.toString();
            const receiverId = receiver.toString();
    
            // Find or create a conversation between sender and receiver
            let conversation = await Conversation.findOne({
                '$or': [
                    { sender: senderId, receiver: receiverId },
                    { sender: receiverId, receiver: senderId }
                ]
            });
    
            if (!conversation) {
                conversation = new Conversation({
                    sender: senderId,
                    receiver: receiverId
                });
                await conversation.save();
            }
    
            // Create and save the new message
            const message = new Message({
                text: text,
                imageUrl: imageUrl,
                videoUrl: videoUrl,
                msgByUserId: msgByUserId,
                seen: false // Assuming new messages are unseen
            });
            const savedMessage = await message.save();
    
            // Add the message to the conversation
            conversation.messages.push(savedMessage._id);
            conversation.updatedAt = new Date(); // Update the updatedAt timestamp
            await conversation.save();
    
            // Populate messages
            const populatedConversation = await Conversation.findById(conversation._id)
                .populate({
                    path: 'messages',
                    options: { sort: { createdAt: 1 } }
                });
    
            // Emit the updated conversation to both sender and receiver
            io.to(senderId).to(receiverId).emit('message', populatedConversation);
    
            // Emit updated conversations list for both users
            await emitUpdatedConversationsList(senderId);
            await emitUpdatedConversationsList(receiverId);
    
        } catch (error) {
            console.error('Error in new-message event:', error);
            socket.emit('error', { message: 'An error occurred while sending the message.' });
        }
    });
    
    // Helper function to emit updated conversation list
    const emitUpdatedConversationsList = async (userId) => {
        try {
            const conversations = await Conversation.find({
                "$or": [
                    { sender: userId },
                    { receiver: userId }
                ]
            })
            .sort({ updatedAt: -1 }) // Sort by the most recent activity
            .populate({
                path: 'messages',
                options: { sort: { createdAt: 1 } } // Ensure messages are sorted by creation time
            })
            .populate('sender', 'name email profile_pic')
            .populate('receiver', 'name email profile_pic');
    
            // Map conversations to include other user details and unseen message count
            const mappedConversations = conversations.map(conv => {
                const otherUser = conv.sender._id.toString() === userId ? conv.receiver : conv.sender;
                const countUnseenMsg = conv.messages.reduce((prev, curr) => prev + (curr.seen ? 0 : 1), 0);
                const lastMsg = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
    
                return {
                    _id: conv._id,
                    userDetails: otherUser,
                    unSeenMsg: countUnseenMsg,
                    lastMsg: lastMsg
                };
            });
    
            // Emit the updated conversations list to the user
            io.to(userId).emit('conversation', mappedConversations);
        } catch (error) {
            console.error('Error emitting updated conversations list:', error);
        }
    };

    /**
     * Handle socket disconnection
     */
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
