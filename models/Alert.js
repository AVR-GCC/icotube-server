const mongoose = require('mongoose');

const AlertSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Alert', AlertSchema);