const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    product: String,
    price: Number,
    count: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
