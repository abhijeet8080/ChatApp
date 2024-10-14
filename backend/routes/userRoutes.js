const express = require('express');
const {registerUser,verifyEmail, checkMail, checkPassword,resetPassword, getUserDetails, logout, updateUserDetails,searchUser,forgotPassword} = require('../controllers/userController');



const router = express.Router();


router.route('/register').post(registerUser);
router.route('/verifyemail').post(verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.route('/email').post(checkMail);

router.route('/password').post(checkPassword);

router.route('/user-details').get(getUserDetails)

router.route('/logout').post(logout)

router.route('/update-user').post(updateUserDetails);

router.route('/search-user').post(searchUser)






module.exports = router;    
