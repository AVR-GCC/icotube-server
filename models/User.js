const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: true,
        enum: ['standard', 'user-paid']
    },
    tokenAddress: {
        type: String,
        required: true
    },
    deployedAt: {
        type: Date,
        required: true
    }
});

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
    },
    contracts: [contractSchema]
});

module.exports = mongoose.model('User', UserSchema);