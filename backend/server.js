const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {userRoute} = require('./routes/userRoute');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MongoDB URI is missing! Check your .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use('user',userRoute);

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
