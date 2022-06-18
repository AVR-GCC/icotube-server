const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    paymentHooks: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Payment'
    },
    created: {
        type: Date,
        default: Date.now
    },
    name: String,
    email: {
        type: String,
        required: true
    },
    title: String,
    type: {
        type: String,
        enum: [
            'Platform',
            'Blockchain Service'
        ],
        default: 'Platform'
    },
    shortDescription: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: Date.now
    },
    ticker: String,
    tokenType: {
        type: String,
        default: 'ERC20'
    },
    amountPerUser: Number,
    softCap: Number,
    cap: Number,
    totalTokens: Number,
    availableTokens: Number,
    minParticipation: Number,
    maxParticipation: Number,
    accepts: {
        type: [String],
        enum: [
            'BTC',
            'Ethereum',
            'USDT'
        ],
        default: 'BTC'
    },
    isWhitelist: {
        type: Boolean,
        default: false
    },
    officialChat: String,
    github: String,
    bitcoinTalk: String,
    logo: String,
    homepage: String,
    videoUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Posts', PostSchema);