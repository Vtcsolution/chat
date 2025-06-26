  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const crypto = require('crypto');
  const mongoose = require("mongoose");

const registerUser = async (req, res) => {
  try {
    console.log("➡️ Register route hit");

    const { username, email, password, image } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const getRandomDOB = () => {
      const start = new Date(1980, 0, 1);
      const end = new Date(2005, 0, 1);
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const randomBios = [
      "Tech enthusiast 🌐",
      "Coffee + Code = ❤️",
      "Dreaming big, building small.",
      "Here to learn and grow.",
      "Exploring the digital universe."
    ];

    const getRandomBio = () => randomBios[Math.floor(Math.random() * randomBios.length)];

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image: image || null,
      dob: getRandomDOB(),
      bio: getRandomBio()
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image,
        token,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

   res.status(200).json({
  success: true,
  user: {
    _id: user._id,
    username: user.username,
    email: user.email,
    image: user.image,
  },
});

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select("username email image bio dob totalTime totalPayment createdAt");
  res.status(200).json({ success: true, users });
};



 const LogoutUser = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        samesite: 'strict',

    });
    res.status(200).json({message: 'Logout successful'});
}
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const deleteUserById = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

///forget password 
const forgetPassword = async (req, res) => {
    try{
    const {email} = req.body;
     const user= await User.findOne({email});
     if (!user){
        return res.status (400).json ({message: 'User not found'});
     }
         // Generate secure random token
         const token = crypto.randomBytes(32).toString('hex');
         user.resetPasswordToken = token;
         user.resetPasswordExpires = Date.now() +360000; 
         await user.save();

         ///reset password link
         const resetLink = `http://localhost:5000/api/users/reset-password/${token}`;
         // Send email with reset link (implementation not shown)
         res.status(200).json({message: 'Reset password link sent', resetLink});
    }catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const resetPassword = async (req, res) => {
    try{
        const token = req.params.token;
        const {newPassword} = req.body;
        const user = await User.findOne ({
            resetPasswordToken: token,
            resetPasswordExpires: {$gt: Date.now()}
        })
        if (!user) {
            return res.status(400).json({message: 'Invalid or expired token'});
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({message: 'Password reset successful'});
    }catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const fetchUserById = async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserById = async (req, res) => {
  const { userId } = req.params;
  const { username, email, image, dob, bio } = req.body;


  // Validate ObjectId
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate and update inputs
    if (username) {
      if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
      }
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Store image as provided (no Cloudinary validation)
    if (image !== undefined) {
      user.image = image || "";
    }

    if (dob) {
      const parsedDate = new Date(dob);
      if (isNaN(parsedDate.getTime())) { // Fixed typo
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (parsedDate > new Date()) {
        return res.status(400).json({ message: "Date of birth cannot be in the future" });
      }
      user.dob = parsedDate;
    }

    if (bio) {
      if (bio.length > 500) {
        return res.status(400).json({ message: "Bio cannot exceed 500 characters" });
      }
      user.bio = bio;
    }

    await user.save();

    // Return updated user data (excluding sensitive fields)
    const updatedUser = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  registerUser,
  getAllUsers,
  loginUser,
  LogoutUser,
  forgetPassword,
  resetPassword,
  fetchUserById,
  deleteUserById,
  updateUserById,
  updatePassword,
  getMe
};