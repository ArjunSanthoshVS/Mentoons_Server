const mongoose = require('mongoose');

module.exports = () => {
    try {
        mongoose.connect("mongodb+srv://arjunsanthosh738:mkAR7sPKQOtzxxGF@cluster0.sg1iarz.mongodb.net/Mentoons")
        console.log("Connected Successfully...!")
    } catch (error) {
        console.log("Not Connected...!")
    }
}

