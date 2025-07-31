
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const Event = require('../models/Event');
const cloudinary = require('../utils/cloudinary');
const { geocodeAddress } = require('../utils/geocode');
const auth = require('../middleware/authMiddleware');
//const admin = require('../middleware/adminMiddleware');
const axios = require('axios');

router.post('/bulk', async (req, res) => {
  try {
    const inputEvents = req.body;

    if (!Array.isArray(inputEvents)) {
      return res.status(400).json({ message: "Payload must be an array of events" });
    }

    const eventsWithGeo = await Promise.all(
      inputEvents.map(async (event) => {
        if (!event.address) {
          throw new Error(`Missing address for event: ${event.name}`);
        }

        const coords = await geocodeAddress(event.address);
        if (!coords) {
          throw new Error(`Failed to geocode address: ${event.address}`);
        }

        return {
          ...event,
          location: {
            lat: coords.lat,
            lng: coords.long
          }
        };
      })
    );

    const savedEvents = await Event.insertMany(eventsWithGeo);
    res.status(201).json({ message: "Events created successfully", events: savedEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while bulk creating events", error: err.message });
  }
});

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

    // ✅ Upload image to Cloudinary if provided
    let imageUrl = '';
    if (image) {
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`);
      imageUrl = result.secure_url;
    }

    // ✅ Geocode location if missing
    let resolvedLocation = location;
    if (!location?.lat || !location?.lng) {
      const fullAddress = `${address}, ${city}`;
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        resolvedLocation = { lat: coords.lat, lng: coords.lng };
      } else {
        console.warn('Geocoding failed for:', fullAddress);
      }
    }

    // ✅ Save event
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
      location: resolvedLocation,
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
