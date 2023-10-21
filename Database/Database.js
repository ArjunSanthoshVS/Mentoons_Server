require('dotenv').config()
const mongoose = require('mongoose');

module.exports = () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("Connected Successfully...!")
    } catch (error) {
        console.log("Not Connected...!")
    }
}

