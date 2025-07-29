
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const Event = require('../models/Event');
const cloudinary = require('../utils/cloudinary');
const { geocodeAddress } = require('../utils/geocode');

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

router.post('/', protect, adminOnly, async (req, res) => {
  const { name, description, instagram, website, ticketLink, image, address, date, city } = req.body;
  const loc = await geocodeAddress(address);
  let imageUrl = '';
  if (image && image.trim() !== '') {
    const upload = await cloudinary.uploader.upload(image, { folder: "events" });
    imageUrl = upload.secure_url;
  }

  const event = await Event.create({
    name,
    description,
    instagram,
    website,
    ticketLink,
    address,
    date,
    city,
    imageUrl,
    location: loc
  });

  res.status(201).json(event);
});

module.exports = router;
