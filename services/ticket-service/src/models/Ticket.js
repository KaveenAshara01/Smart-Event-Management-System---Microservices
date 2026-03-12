const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    eventTitle: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    qrCode: { type: String, required: true }, // Base64 representation
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['valid', 'used', 'cancelled'], default: 'valid' },
    pricePaid: { type: Number, required: true }
});

module.exports = mongoose.model('Ticket', ticketSchema);
