const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
    }
});

const Payment = mongoose.model("payment", paymentSchema)

module.exports = { Payment }