const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

// --- DATABASE SCHEMA ---
const QuoteSchema = new mongoose.Schema({
  text: String,
  quote: String,
  createdAt: { type: Date, default: Date.now }
});
const Quote = mongoose.model('Quote', QuoteSchema);

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String
});
const Product = mongoose.model('Product', ProductSchema);

// Basket Schema
const BasketItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const BasketSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [BasketItemSchema]
}, { timestamps: true });

const Basket = mongoose.model('Basket', BasketSchema);

// --- ROUTES ---

// Existing Status Route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "Online",
    message: "AWS Backend is reachable!",
    owner: "Student Name", // Change this to your name!!!
    timestamp: new Date()
  });
});


// NEW: Route to save data to MongoDB
app.post('/api/save-quote', async (req, res) => {
  try {
    // Adding default values in case one is missing
    const { text = "No text", quote = "No quote" } = req.body;

    const newEntry = await Quote.create({ text, quote });

    // alternative method for create
    // const newEntry = new Quote({ text, quote });
    // await newEntry.save();

    console.log("📥 Data saved to MongoDB:", newEntry);
    res.status(201).json({ message: "Saved successfully!", data: newEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all saved quotes (newest first)
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// CREATE a new product
app.post('/products', async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const newProduct = await Product.create({ name, price, description, image });
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// UPDATE a product by ID
app.put('/products/:id', async (req, res) => {
try {
const { id } = req.params;
const updates = req.body;

const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
  new: true,
  runValidators: true
});

  if (!updatedProduct) {
    return res.status(404).json({ message: 'Product not found' });
}
  res.json({ message: 'Product updated', product: updatedProduct });
} catch (err) {
  res.status(500).json({ message: 'Error updating product', error: err.message });
}
});

// DELETE a product by ID
app.delete('/products/:id', async (req, res) => {
  try {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
if (!deleted) {
  return res.status(404).json({ message: 'Product not found' });
}
    res.json({ message: 'Product deleted', product: deleted });
}   catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
}
});

// BASKET ROUTES
// Get basket for user
app.get('/basket/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let basket = await Basket.findOne({ userId }).populate('items.product');
    
    if (!basket) {
      return res.status(200).json({ userId, items: [] });
    }
    
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to basket
app.post('/basket/add', async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    
    let basket = await Basket.findOne({ userId });
    
    if (!basket) {
      basket = new Basket({ userId, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = basket.items.findIndex(item => item.product.toString() === productId);
      
      if (itemIndex > -1) {
        basket.items[itemIndex].quantity += quantity;
      } else {
        basket.items.push({ product: productId, quantity });
      }
    }
    
    await basket.save();
    await basket.populate('items.product');
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from basket
app.delete('/basket/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    const basket = await Basket.findOne({ userId });
    
    if (!basket) {
      return res.status(404).json({ message: 'Basket not found' });
    }
    
    basket.items = basket.items.filter(item => item.product.toString() !== productId);
    
    await basket.save();
    await basket.populate('items.product');
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
    process.exit(1);
  });
