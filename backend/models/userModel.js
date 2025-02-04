const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: String,
    email: { type: String, unique: true },
    password: String,
    ChatRef: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }]
});

// Just another method for hashing password
// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         const salt = await bcrypt.genSalt(10); // Generate salt
//         this.password = await bcrypt.hash(this.password, salt); // Hash password
//     }
//     next();
// });

const userModel = mongoose.model('users', userSchema);

module.exports = {userModel};