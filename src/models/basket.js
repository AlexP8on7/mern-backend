const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const basketItemSchema = new Schema({
product: { type: Schema. Types.ObjectId, ref: 'Product', required: true },
quantity: { type: Number, default: 1, min: 1 }
});

const basketSchema = new Schema({
userId: { type: String, required: true, index: true },
items: [basketItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Basket', basketSchema);