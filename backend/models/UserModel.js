const mongoose  = require("mongoose");

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
    },
    profile_pic:{
        type:String,
        default:""
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    verificationCode:String,
    expiresAt: {
        type: Date,
        default: () => Date.now() + 10 * 60 * 1000, // 10 minutes from creation
    },
    resetPasswordToken: String, 
    resetPasswordExpires: Date, 

},{
    timestamps:true
});
userSchema.index({ email: 1 });
module.exports = mongoose.model("User",userSchema);