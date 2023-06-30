const mongoose = require("mongoose");

mongoose.set('strictQuery', true);

mongoose.connect("mongodb://127.0.0.1:27017/streams");

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    salary: Number,
    isActive: Boolean
});

const User = mongoose.model("User", userSchema);

module.exports = User;