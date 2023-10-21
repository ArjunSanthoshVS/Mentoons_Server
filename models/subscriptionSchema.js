const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema({
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

const Subscription = mongoose.model("subscription", subscriptionSchema)

module.exports = { Subscription }