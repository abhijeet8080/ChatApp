const Conversation = require('./models/Conversation'); // Ensure the model is correctly imported

/**
 * Fetches conversations for a given user and returns the mapped conversations.
 * 
 * @param {string} userId - The ID of the user whose conversations are to be fetched.
 * @returns {array} - The mapped conversation data with unseen messages and other user details.
 */
const getConversation = async (userId) => {
    if (userId) {
        try {
            // Fetch conversations where the user is either the sender or receiver
            const conversations = await Conversation.find({
                "$or": [
                    { sender: userId },
                    { receiver: userId }
                ]
            })
            .sort({ updatedAt: -1 }) // Sort conversations by most recent update
            .populate({
                path: 'messages',
                options: { sort: { createdAt: 1 } } // Ensure messages are sorted by creation time
            })
            .populate('sender', 'name email profile_pic')
            .populate('receiver', 'name email profile_pic');

            //console.log(`Fetched ${conversations.length} conversations for user: ${userId}`);

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

            //console.log("Mapped Conversations: ", mappedConversations);
            return mappedConversations;

        } catch (error) {
            console.error('Error fetching conversations:', error);
            return { error: 'Failed to retrieve conversations.' };
        }
    } else {
        return [];
    }
};

module.exports = { getConversation };
