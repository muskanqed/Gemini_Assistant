const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: String,
    email: { type: String, unique: true },
    Password: String,
    ChatRef: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }]
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;