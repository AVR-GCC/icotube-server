const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'Platform',
            'Blockchain Service'
        ],
        required: true,
        default: 'Platform'
    },
    email: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    isWhitelist: {
        type: Boolean,
        default: false
    },
    fundraisingGoal: Number,
    ticker: {
        type: String,
        required: true
    },
    tokenType: {
        type: String,
        default: 'ERC20'
    },
    homepage: String,
    videoUrl: {
        type: String,
        required: true
    },
    icoOrAirdrop: {
        type: String,
        enum: ['ICO', 'Airdrop'],
        default: 'ICO'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Posts', PostSchema);