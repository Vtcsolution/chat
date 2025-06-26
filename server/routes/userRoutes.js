const express = require('express');
const { registerUser,deleteUserById,getMe,getAllUsers,  loginUser, LogoutUser, forgetPassword, resetPassword, fetchUserById, updateUserById, updatePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/adminProtect');
const router = express.Router();

router.post("/register", registerUser);
router.post('/login', loginUser);
router.get('/logout', LogoutUser);
router.get('/all',adminProtect ,getAllUsers); // 
router.delete('/:userId',adminProtect,  deleteUserById); 

router.post('/forgot-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.get('/user/:userId', fetchUserById)
router.put('/update-user/:userId', updateUserById);
router.put('/update-password/:userId', updatePassword);
router.get('/me', protect, getMe); // ✅ NEW

module.exports = router;