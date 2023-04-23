const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: { type: String },
    salt: { type: String },
    imageUrl: {
        type: String,
        required: false
    },
    token: {
        type: String
    },
    emailConfirmed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', UserSchema);