
const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  name: String,
  description: String,
  instagram: String,
  website: String,
  ticketLink: String,
  imageUrl: String,
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  city: String,
  date: Date,
  price: Number
});
module.exports = mongoose.model('Event', EventSchema);
