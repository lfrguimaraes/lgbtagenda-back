
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const Event = require('../models/Event');
const cloudinary = require('../utils/cloudinary');
const { geocodeAddress } = require('../utils/geocode');
const auth = require('../middleware/authMiddleware');
//const admin = require('../middleware/adminMiddleware');

router.get('/', async (req, res) => {
  const { city, date } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (date) filter.date = { $gte: new Date(date) };
  const events = await Event.find(filter);
  res.json(events);
});

router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});



// Update event
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const {
      name,
      description,
      instagram,
      website,
      ticketLink,
      address,
      city,
      price,
      date,
      location,
      image,
      venueName,
      startDate,
      endDate
    } = req.body;

    // Upload new image if provided
    if (image) {
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`);
      event.imageUrl = result.secure_url;
    }

    // Update other fields
    event.name = name;
    event.description = description;
    event.instagram = instagram;
    event.website = website;
    event.ticketLink = ticketLink;
    event.address = address;
    event.city = city;
    event.price = price;
    event.date = date;
    event.location = location;
    event.venueName = venueName;
    event.startDate = startDate;
    event.endDate = endDate;

    await event.save();
    res.status(200).json(event);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Server error while updating event' });
  }
});

// Create event
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      instagram,
      website,
      ticketLink,
      address,
      city,
      price,
      date,
      location,
      image,
      venueName,
      startDate,
      endDate
    } = req.body;

    let imageUrl = '';
    if (image) {
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`);
      imageUrl = result.secure_url;
    }

    const event = new Event({
      name,
      description,
      instagram,
      website,
      ticketLink,
      address,
      city,
      price,
      date,
      location,
      imageUrl,
      venueName,
      startDate,
      endDate
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Server error while creating event' });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Delete event
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
