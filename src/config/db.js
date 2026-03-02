const mongoose = require('mongoose');
const Product = require('../models/Product'); // Needed for seeding

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Successfully connected to MongoDB");

    // Seeding Logic moved here
    const count = await Product.countDocuments();
    if (count === 0) {
      const seedProducts = [ /* ... your seed data ... */ ];
      await Product.insertMany(seedProducts);
      console.log('🟢 Seeded initial products');
    }

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};