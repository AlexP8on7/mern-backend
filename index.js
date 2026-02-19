const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet'); // New security import
const cors = require('cors');     // FIX: You forgot to require cors
require('dotenv').config();

const app = express();

// Security and Middleware
app.use(helmet());           // Protects against common web vulnerabilities
app.use(cors());             // Allows your mobile app to talk to this server [cite: 243]
app.use(express.json());      // Standard for receiving JSON data

// Environment Variables
const MONGO_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 3000;

// Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "Online",
    message: "AWS Backend is reachable!",
    owner: "Student Name", // Change this to your name!!!
    timestamp: new Date()
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Stop the server if the password is wrong
  });