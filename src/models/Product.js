const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  description: { type: String },
  image: { type: String } // Store Base64 string here
});

// Important: module.exports
module.exports = mongoose.model('Product', productSchema);