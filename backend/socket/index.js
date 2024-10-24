// socket/index.js
const { Server } = require("socket.io");
const http = require("http");
const app = require("../app");

const server = http.createServer(app);

// Initialize the Socket.IO server with CORS options
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow the frontend URL
    methods: ["GET", "POST"], // Allowed methods
    credentials: true, // Allow credentials (cookies, etc.)
  },
});

const { getUserDetailsFromToken } = require("../middleware/auth");
const User = require("../models/UserModel");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");
const mongoose = require("mongoose");

// Create HTTP server using the existing app

// Online users tracked using a Set for efficient lookup
const onlineUser = new Set();

// Handle socket connection
io.on("connection", async (socket) => {
  console.log("Connected user:", socket.id);
  try {
    // Retrieve token from socket handshake
    const token = socket.handshake.auth.token;

    if (!token) {
      //console.log('No token provided. Disconnecting socket:', socket.id);
      socket.disconnect(true);
      return;
    }

    // Get user details from token
    const user = await getUserDetailsFromToken(token);

    if (!user) {
      //console.log('Invalid token. Disconnecting socket:', socket.id);
      socket.disconnect(true);
      return;
    }

    // Join the user to a room identified by their user ID
    const userId = user._id.toString();
    socket.join(userId);

    // Add the user to the online users Set
    onlineUser.add(userId);

    // Emit the updated list of online users to all connected clients
    io.emit("onlineUser", Array.from(onlineUser));

    /**
     * Event: 'sidebar'
     * Description: Fetches all conversations for the current user to display in the sidebar.
     */
    socket.on("sidebar", async () => {
      try {
        // Fetch conversations where the user is either the sender or receiver
        const conversations = await Conversation.find({
          $or: [{ sender: userId }, { receiver: userId }],
        })
          .sort({ updatedAt: -1 }) // Sort conversations by most recent
          .populate({
            path: "messages",
            options: { sort: { createdAt: 1 } }, // Ensure messages are sorted by creation time
          })
          .populate("sender", "name email profile_pic")
          .populate("receiver", "name email profile_pic");

        // Map conversations to include other user details and unseen message count
        const mappedConversations = conversations.map((conv) => {
          // Determine the other user in the conversation
          const otherUser =
            conv.sender._id.toString() === userId ? conv.receiver : conv.sender;

          // Count unseen messages
          const countUnseenMsg = conv.messages.reduce(
            (prev, curr) => prev + (!curr.seen ? 1 : 0),
            0
          );

          // Get the last message
          const lastMsg =
            conv.messages.length > 0
              ? conv.messages[conv.messages.length - 1]
              : null;

          return {
            _id: conv._id,
            userDetails: otherUser,
            unSeenMsg: countUnseenMsg,
            lastMsg: lastMsg,
          };
        });

        // Emit the conversations back to the requesting socket
        socket.emit("conversation", mappedConversations);
      } catch (error) {
        console.error("Error fetching conversations for sidebar:", error);
        socket.emit("conversation", {
          error: "Failed to retrieve conversations.",
        });
      }
    });

    /**
     * Event: 'seen'
     * Description: Updates the status of all messages that are read by the user.
     */
    /**
     * Event: 'seen'
     * Description: Updates the status of all messages that are read by the user.
     */
    socket.on("seen", async (msgByUserId) => {
      try {
        // Validate that msgByUserId is provided
        if (!msgByUserId) {
          socket.emit("error", {
            message: "msgByUserId is required for the seen event.",
          });
          return;
        }

        // Ensure msgByUserId is a string
        const senderId = msgByUserId.toString();

        // Find the conversation between the current user and msgByUserId
        const conversation = await Conversation.findOne({
          $or: [
            { sender: userId, receiver: senderId },
            { sender: senderId, receiver: userId },
          ],
        });

        if (!conversation) {
          //console.log(`No conversation found between user ${userId} and user ${senderId}`);
          socket.emit("error", { message: "Conversation not found." });
          return;
        }

        // Update messages sent by senderId that are not yet seen
        const updateResult = await Message.updateMany(
          {
            _id: { $in: conversation.messages },
            msgByUserId: senderId,
            seen: false, // Only update unseen messages
          },
          { $set: { seen: true } }
        );

        //console.log(`Marked ${updateResult.nModified} messages as seen in conversation ${conversation._id}`);

        // Emit an event to the sender to notify that their messages have been seen
        if (updateResult.nModified > 0) {
          io.to(senderId).emit("messages-seen", {
            conversationId: conversation._id,
            userId: userId,
          });
        }
      } catch (error) {
        console.error("Error in seen event:", error);
        socket.emit("error", {
          message: "An error occurred while updating message seen status.",
        });
      }
    });

    /**
     * Event: 'message-page'
     * Description: Fetches user details and conversation for the message page.
     */
    // Import mongoose at the top of your file

    // Inside your socket.on('message-page', async (userIdToMessage) => { ... }) event handler
    socket.on("message-page", async (userIdToMessage) => {
      //console.log('Received userIdToMessage:', userIdToMessage); // Debugging line

      try {
        if (!userIdToMessage) {
          socket.emit("message-page", { error: "No target user ID provided." });
          return;
        }

        // Ensure userId is a string
        const targetUserId = userIdToMessage.toString();

        // Validate that targetUserId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
          socket.emit("message-page", { error: "Invalid user ID provided." });
          return;
        }

        // Fetch user details of the target user
        const userDetails = await User.findById(targetUserId).select(
          "-password"
        );

        if (!userDetails) {
          socket.emit("message-page", { error: "User not found." });
          return;
        }

        // Check if a conversation exists between the current user and target user
        let conversation = await Conversation.findOne({
          $or: [
            { sender: userId, receiver: targetUserId },
            { sender: targetUserId, receiver: userId },
          ],
        })
          .populate({
            path: "messages",
            options: { sort: { createdAt: 1 } }, // Ensure messages are sorted by creation time
          })
          .populate("sender", "name email profile_pic")
          .populate("receiver", "name email profile_pic");

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
            online: onlineUser.has(targetUserId),
          },
          conversation: conversation,
        };

        // Emit the payload back to the requesting socket
        socket.emit("message-page-data", payload);
      } catch (error) {
        console.error("Error handling message-page event:", error);
        socket.emit("message-page", { error: "An error occurred." });
      }
    });

    // New event to handle marking messages as seen
    socket.on("mark-messages-seen", async (data) => {
      try {
        const { conversationId, userId } = data;

        // Find the conversation and populate messages
        const conversation = await Conversation.findById(
          conversationId
        ).populate("messages");

        if (!conversation) {
          console.error("Conversation not found:", conversationId);
          return;
        }

        // Update each message in the conversation to mark as seen
        const updatedMessages = conversation.messages.map(async (message) => {
          if (message.msgByUserId !== userId && !message.seen) {
            message.seen = true;
            await message.save();
          }
        });

        // Wait for all messages to be updated
        await Promise.all(updatedMessages);

        // Emit an event to notify clients that messages have been seen
        io.to(conversationId).emit("messages-seen", { conversationId });
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    /**
     * Event: 'new-message'
     * Description: Handles sending a new message between users.
     */
    socket.on("new-message", async (data) => {
      try {
        // Destructure data, excluding 'sender' as we'll use server-side 'userId'
        const { receiver, text, imageUrl, videoUrl } = data;

        if (!receiver) {
          socket.emit("error", { message: "Receiver ID is required." });
          return;
        }

        // Use server-side userId as senderId
        const senderId = userId;
        const receiverId = receiver.toString();

        // Validate senderId and receiverId
        if (!senderId || !receiverId) {
          socket.emit("error", { message: "Invalid sender or receiver ID." });
          return;
        }

        // Prevent users from sending messages to themselves
        if (senderId === receiverId) {
          socket.emit("error", {
            message: "Cannot send messages to yourself.",
          });
          return;
        }

        // Check if the receiver exists
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
          socket.emit("error", { message: "Receiver does not exist." });
          return;
        }

        // Find or create a conversation between sender and receiver
        let conversation = await Conversation.findOne({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ],
        });

        if (!conversation) {
          conversation = new Conversation({
            sender: senderId,
            receiver: receiverId,
          });
          await conversation.save();
        }

        // Create and save the new message
        const message = new Message({
          text: text || "",
          imageUrl: imageUrl || "",
          videoUrl: videoUrl || "",
          msgByUserId: senderId,
          seen: false, // Assuming new messages are unseen
        });
        const savedMessage = await message.save();

        // Add the message to the conversation
        conversation.messages.push(savedMessage._id);
        conversation.updatedAt = new Date(); // Update the updatedAt timestamp
        await conversation.save();

        // Populate messages, sender, and receiver
        const populatedConversation = await Conversation.findById(
          conversation._id
        )
          .populate({
            path: "messages",
            options: { sort: { createdAt: 1 } },
          })
          .populate("sender", "name email profile_pic")
          .populate("receiver", "name email profile_pic");

        // Emit the updated conversation to both sender and receiver
        io.to(senderId).to(receiverId).emit("message", populatedConversation);

        // Emit updated conversations list for both users
        await emitUpdatedConversationsList(senderId);
        await emitUpdatedConversationsList(receiverId);
      } catch (error) {
        console.error("Error in new-message event:", error);
        socket.emit("error", {
          message: "An error occurred while sending the message.",
        });
      }
    });

    // Helper function to emit updated conversation list
    const emitUpdatedConversationsList = async (userId) => {
      try {
        const conversations = await Conversation.find({
          $or: [{ sender: userId }, { receiver: userId }],
        })
          .sort({ updatedAt: -1 }) // Sort by the most recent activity
          .populate({
            path: "messages",
            options: { sort: { createdAt: 1 } }, // Ensure messages are sorted by creation time
          })
          .populate("sender", "name email profile_pic")
          .populate("receiver", "name email profile_pic");

        // Map conversations to include other user details and unseen message count
        const mappedConversations = conversations.map((conv) => {
          const otherUser =
            conv.sender._id.toString() === userId ? conv.receiver : conv.sender;
          const countUnseenMsg = conv.messages.reduce(
            (prev, curr) => prev + (!curr.seen ? 1 : 0),
            0
          );
          const lastMsg =
            conv.messages.length > 0
              ? conv.messages[conv.messages.length - 1]
              : null;

          return {
            _id: conv._id,
            userDetails: otherUser,
            unSeenMsg: countUnseenMsg,
            lastMsg: lastMsg,
          };
        });

        // Emit the updated conversations list to the user
        io.to(userId).emit("conversation", mappedConversations);
      } catch (error) {
        console.error("Error emitting updated conversations list:", error);
      }
    };

    /**
     * Handle socket disconnection
     */
    socket.on("disconnect", () => {
      if (user && user._id) {
        onlineUser.delete(user._id.toString());
        //console.log('Disconnected user:', socket.id);

        // Emit the updated list of online users to all connected clients
        io.emit("onlineUser", Array.from(onlineUser));
      }
    });
  } catch (connectionError) {
    console.error("Error during socket connection:", connectionError);
    socket.disconnect(true);
  }
});

// Export the io and server instances
module.exports = { io, server };
