require('dotenv').config(); // Loads MONGO_URI from .env
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function migrateDates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected.');

    console.log('🔍 Looking for events missing startDate but with legacy date...');
    const eventsToMigrate = await Event.find({
      startDate: { $exists: false },
      date: { $exists: true }
    });

    console.log(`📦 Found ${eventsToMigrate.length} events to migrate.`);

    for (const event of eventsToMigrate) {
      console.log(`➡ Migrating: ${event.name} (${event.date})`);
      event.startDate = event.date;
      event.endDate = null;
      await event.save();
      console.log(`✔ Migrated: ${event.name}`);
    }

    console.log('✅ Migration complete.');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

migrateDates();
