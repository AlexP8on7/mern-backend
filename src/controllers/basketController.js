const Basket = require('../models/basket');

exports.addToBasket = async (req, res) => {
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
};

exports.getBasket = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const basket = await Basket.findOne({ userId }).populate('items.product');
    
    if (!basket) {
      return res.status(404).json({ message: 'Basket not found' });
    }
    
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromBasket = async (req, res) => {
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
};

