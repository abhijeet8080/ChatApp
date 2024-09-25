const express = require('express');
const {registerUser, checkMail, checkPassword, getUserDetails, logout, updateUserDetails} = require('../controllers/userController');



const router = express.Router();


router.route('/register').post(registerUser);

router.route('/email').post(checkMail);

router.route('/password').post(checkPassword);

router.route('/user-details').post(getUserDetails)

router.route('/logout').post(logout)

router.route('/update-user').post(updateUserDetails);





module.exports = router;    
