const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({

    username:{
        type: String,
        required: true, 
        trim: true,
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
    },

     image: {
    type: String, 
    default: "",  
  },
    password: {
        type: String,
        required: true,
        minlength: 6,
       
    }, 
     dob: {
    type: Date,
  },
  bio: {
    type: String,
    trim: true,
  },
resetPasswordToken: String,
resetPasswordExpires: Date,

   }, {
  timestamps: true // automatically adds createdAt & updatedAt
});


module.exports = mongoose.model ('User', userSchema)
