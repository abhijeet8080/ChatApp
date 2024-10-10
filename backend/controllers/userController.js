const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { getUserDetailsFromToken} = require("../middleware/auth");
//Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profile_pic } = req.body;
        console.log("Request received:", req.body);  // Debugging line
        const checkMail = await User.findOne({ email });  // Await here
        if (checkMail) {
            return res.status(400).json({
                message: "User Already Exists",
                error: true
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const payload = {
            name,
            email,
            profile_pic,
            password: hashPassword
        };

        const user = new User(payload);
        const userSave = await user.save();

        // Remove the password field from the userSave object
        const userResponse = userSave.toObject();  // Convert to plain object if it's a Mongoose document
        delete userResponse.password;

        return res.status(201).json({
            message: "User Created Successfully",
            data: userResponse,  // Send the user object without the password
            success: true
        });
    } catch (error) {
        console.error("Error:", error);  // Debugging line
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};

//Check Mail
const checkMail = async (req, res) => {
    try {
        console.log("checkMail called");
        const { email } = req.body;
        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            // If user not found, return an error
            return res.status(400).json({
                message: "Email Does Not Exist",
                error: true
            });
        }

        // If user is found, return success message
        return res.status(200).json({
            message: "Email Verified",
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};


//Check Password
const checkPassword = async (req, res) => {
    try {
        const { userId, password } = req.body;
        console.log(req.body)

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
            });
        }

        const verifyPassword = await bcrypt.compare(password, user.password);

        if (!verifyPassword) {
            return res.status(400).json({
                message: "Please check your password",
                error: true,
            });
        }

        const tokenData = {
            id: user._id,
            email: user.email
        };

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "5d" });

        const cookieOptions = {
            httpOnly: true,  // Corrected from 'http' to 'httpOnly'
            secure: process.env.NODE_ENV === "production",  // Secure only in production
        };

        // Set cookie and respond
        res.cookie('token', token, cookieOptions).status(200).json({
            message: "Login Successfully",
            success: true,
            token: token
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};

//getUserDetails
const getUserDetails = async (req, res) => {
    try {
        console.log("Get user details called");
        const token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            throw new ErrorHandler("Please Login to access this resource", 401);
        }
        const authToken = token.split(" ")[1];

        const user = await getUserDetailsFromToken(authToken); // Await here

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access. Please login again.",
                logout:true,
                error: true
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};
//Logout
const logout = async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,  // Changed from 'http' to 'httpOnly'
            secure: process.env.NODE_ENV === "production",  // Set secure based on environment
            expires: new Date(Date.now() - 1000)  // Set to expire immediately
        };

        console.log("Logging out user..."); // Optional logging for debugging

        return res.cookie('token', '', cookieOptions).status(200).json({
            message: "Session out",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};
// Update User Details
const updateUserDetails = async (req, res) => {
    try {
        const token = req.body.token || ""; // Correctly extract the token
        const user = await getUserDetailsFromToken(token);
        console.log(user);

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access. Please login again.",
                error: true
            });
        }

        const { name, profile_pic } = req.body;
        console.log(req.body);

        // Validate input
        if (!name && !profile_pic) {
            return res.status(400).json({
                message: "Please provide at least one field to update.",
                error: true
            });
        }

        const updateUser = await User.updateOne(
            { _id: user._id },
            { name, profile_pic }
        );

        if (updateUser.nModified === 0) {
            return res.status(404).json({
                message: "User not found or no changes made.",
                error: true
            });
        }

        // Optionally fetch the updated user info
        const userInfo = await User.findById(user._id);
        console.log(userInfo);

        return res.status(200).json({
            message: "User Details Updated Successfully",
            data: userInfo,
            success: true
        });
    } catch (error) {
        console.error("Error updating user details:", error);
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};


const searchUser = async (req, res) => {
    try {
        const { search } = req.body;
        let user;

        if (!search) {
            // Fetch all users if no search term is provided
            user = await User.find({}).select("-password");
        } else {
            const query = new RegExp(search, "i", "g");
            user = await User.find({
                "$or": [
                    { name: query },
                    { email: query }
                ]
            }).select("-password");
        }

        return res.json({
            message: 'All user',
            data: user,
            success: true
        });
    } catch (error) {
        console.error("Error user details:", error);

        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};


module.exports = {registerUser,checkMail, checkPassword,getUserDetails,logout,updateUserDetails,searchUser};