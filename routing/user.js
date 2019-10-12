const express = require('express');
const router = express.Router();
const {signup,signin,forgotPassword,resetPassword,updatePassword,checkForAuthorizedUsers} = require('../controllers/auth');
const {updateUser,deleteUser,getAllUsers,getLoggedInUserDetails} = require('../controllers/user')


router.post('/signup',signup);
router.post('/signin',signin)
router.get('/users',checkForAuthorizedUsers,getAllUsers);
router.post('/forgotpassword',forgotPassword);
router.patch('/users/resetpassword/:token',resetPassword);
router.patch('/updatepassword',checkForAuthorizedUsers,updatePassword)
router.patch('/updateuser',checkForAuthorizedUsers,updateUser);
router.delete('/deleteuser',checkForAuthorizedUsers,deleteUser);
router.get('/me/:id',checkForAuthorizedUsers,getLoggedInUserDetails)

module.exports = router;