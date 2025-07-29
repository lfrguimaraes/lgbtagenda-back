
const mongoose = require('mongoose');
const TicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  qrImageUrl: String
});
module.exports = mongoose.model('Ticket', TicketSchema);
