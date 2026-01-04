const mongoose = require('mongoose');
const config = require('config');
const { Event } = require('../models/event');

async function run() {
  const db = config.get('db');
  await mongoose.connect(db);

  const filter = {
    type: { $in: ['Mehndi', 'Barat', 'Walima'] },
    budget: { $in: ['Low', 'Medium', 'High'] }
  };

  const rules = {
    Low: {
      priceRange: { minPrice: 1000, maxPrice: 2000 },
      peopleRange: { minPeople: 3, maxPeople: 20 },
      availability: { days: 'Monday–Friday', startTime: '09:00', endTime: '22:00' }
    },
    Medium: {
      priceRange: { minPrice: 2000, maxPrice: 3500 },
      peopleRange: { minPeople: 3, maxPeople: 30 },
      availability: { days: 'Monday–Saturday', startTime: '09:00', endTime: '23:00' }
    },
    High: {
      priceRange: { minPrice: 5000, maxPrice: 50000 },
      peopleRange: { minPeople: 3, maxPeople: 100 },
      availability: { days: 'All days', startTime: '00:00', endTime: '24:00' }
    }
  };

  const events = await Event.find(filter);
  let updated = 0;
  for (const e of events) {
    const cfg = rules[e.budget];
    if (!cfg) continue;
    e.priceRange = cfg.priceRange;
    e.peopleRange = cfg.peopleRange;
    e.availability = cfg.availability;
    await e.save();
    updated += 1;
  }

  console.log(JSON.stringify({ matched: events.length, updated }));
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});