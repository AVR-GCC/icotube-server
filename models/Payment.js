const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    id: String,
    scheduled_for: Date,
    event: Object
});

module.exports = mongoose.model('Payment', PaymentSchema);