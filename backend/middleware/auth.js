const jwt = require('jsonwebtoken');
const User = require("../models/UserModel");

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return {
            message: "Session out",
            logout: true
        };
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password"); // Optionally exclude password
        return user ? user : null; // Return user or null if not found
    } catch (error) {
        return null; // Return null if token verification fails
    }
};




module.exports = {getUserDetailsFromToken};