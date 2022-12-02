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
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
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
    type: String,
    tokenRole: String,
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
    tokenType: String,
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
    videoUrl: String,
    coinExplorerLink: String,
    linkedinLink: String,
});

module.exports = mongoose.model('Posts', PostSchema);