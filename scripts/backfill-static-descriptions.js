// Backend/scripts/backfill-static-descriptions.js
const mongoose = require('mongoose');
const config = require('config');
const { Event } = require('../models/event');

const text = {
  Corporate: `✅ CORPORATE EVENTS – PROFESSIONAL & POLISHED
Event Style: Conferences, seminars, product launches, annual dinners

What we offer:
• Professional stage & podium setup
• Company branding on backdrop / digital screens
• Registration & welcome desk
• Neat seating layout for delegates
• Dedicated area for networking & tea break
• Basic sound system with 2–4 microphones

Ideal for:
• Annual meetings
• Trainings & workshops
• Brand or product launches
• Corporate dinners

Starting From:
• Approx. £2000 for small groups (up to 80–100 people)`,

  Dawat: `✅ DAWAT / FAMILY GATHERING – WARM & HOMELY
Event Style: Family dinners, religious gatherings, small celebrations

What we offer:
• Simple, elegant stage or focal wall
• Comfortable seating arrangement
• Food buffet setup or family‑style serving
• Soft background lighting & decor
• Optional sound system for announcements / naats

Ideal for:
• Family get‑togethers
• Religious dawat
• Post‑event meals (nikah, aqeeqa etc.)

Starting From:
• Approx. £1000 for intimate gatherings (40–60 guests)`,

  'Qawali Night': `✅ QAWALI NIGHT – SPIRITUAL & MUSICAL
Event Style: Spiritual musical evening with live qawali

What we offer:
• Low seating or chair layout as per your choice
• Decorated stage for qawals
• Dedicated sound system tuned for live music
• Warm lighting with traditional accents
• Space for food service / tea setup
• Optional backdrop with Islamic / cultural motifs

Ideal for:
• Mehfil‑e‑Sama
• Charity events & community nights
• Private mehfil at home or hall

Starting From:
• Approx. £1500 depending on artist & sound requirements`,

  Birthday: `✅ BIRTHDAY / CELEBRATION – FUN & COLOURFUL
Event Style: Kids & adults birthdays, milestone celebrations

What we offer:
• Themed backdrop with name & age
• Cake‑cutting table decor
• Balloons, buntings & fun props
• Seating area for guests
• Optional kids activity corner (games, face‑painting etc.)
• Space for food and dessert table

Ideal for:
• Kids birthdays
• 18th / 21st / 30th / 50th milestones
• Surprise parties

Starting From:
• Approx. £800 for small celebrations (30–50 guests)`,
};

async function run() {
  const db = config.get('db');
  await mongoose.connect(db);

  const types = Object.keys(text);
  const events = await Event.find({ type: { $in: types } });

  let updated = 0;
  for (const e of events) {
    const content = text[e.type];
    if (!content) continue;
    e.description = content;
    await e.save();
    updated += 1;
  }

  console.log(JSON.stringify({ matched: events.length, updated }));
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
