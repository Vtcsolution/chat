const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Import route files
const userRoutes = require('./routes/userRoutes');
const aiPsychicRoutes = require("./routes/aiPsychicRoutes");
const chatRoutes = require("./routes/chatRoutes");
const formRoutes = require("./routes/formRoutes");
const adminRoutes = require('./routes/adminRoutes');
const  geocodeRoute = require('./routes/geocode.js');

// Use routes
app.use('/api/users', userRoutes);
app.use("/api/psychics", aiPsychicRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/form", formRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/geocode", geocodeRoute);

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
