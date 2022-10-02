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
    email: {
        type: String,
        required: true
    },
    title: String,
    type: {
        type: String,
        default: 'Platform'
    },
    tokenRole: {
        type: String,
        default: 'Utility'
    },
    importantNote: {
        type: String,
        default: ''
    },
    shortDescription: {
        type: String,
        default: ''
    },
    fundraisingGoal: {
        type: Number,
        default: 0
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
    accepts: String,
    isWhitelist: {
        type: Boolean,
        default: false
    },
    whitepaperLink: String,
    officialChat: String,
    github: String,
    bitcoinTalk: String,
    logo: String,
    homepage: String,
    videoUrl: String
});

module.exports = mongoose.model('Posts', PostSchema);