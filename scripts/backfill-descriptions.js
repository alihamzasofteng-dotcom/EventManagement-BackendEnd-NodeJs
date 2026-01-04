const mongoose = require('mongoose');
const config = require('config');
const { Event } = require('../models/event');

const text = {
  Mehndi: {
    Low: `✅ MEHNDI – LOW BUDGET DESCRIPTION
Event Style: Simple, colorful, budget-friendly
Stage:
• Small wooden stage (8x6 ft)
• Basic yellow and green backdrop
• Artificial marigold garlands
• Simple fairy lights
Seating:
• White plastic chairs with green/yellow ribbons
• 3–4 round tables with basic tablecloth
• No luxury sofa seating
Entrance:
• Simple yellow fabric entrance
• Small artificial flower arch
• Fairy-light border
Lighting:
• Warm fairy lights
• 2 yellow spotlights on stage
• No premium lighting effects
Décor & Props:
• Mehndi trays
• Small dholki setup
• Basic matka decoration
Food Setup:
• Basic buffet table with simple cloth
• Standard catering utensils`,
    Medium: `✅ MEHNDI – MEDIUM BUDGET DESCRIPTION
Event Style: Bright, traditional, well-decorated
Stage:
• Medium-sized stage (10x8 ft)
• Custom printed backdrop (mehndi patterns)
• Real & artificial marigold mix
• LED fairy curtain
Seating:
• Banquet chairs with yellow/green covers
• Front row has 2–3 sofa seats
• Round tables with centerpieces
Entrance:
• Floral arch with marigold + roses
• LED walkway lights
• Colorful fabric drapes
Lighting:
• Warm spotlights
• Stage color-wash lighting
• Floor uplights (orange & green tones)
Décor & Props:
• Dholki corner with decorated props
• Mehndi-themed photo booth
• Custom name standee
Food Setup:
• Decorated buffet table
• Proper warmers and catering setup`,
    High: `✅ MEHNDI – HIGH BUDGET DESCRIPTION
Event Style: Luxury, vibrant, premium décor
Stage:
• Large designer stage (18x10 ft)
• Floral wall + LED screen
• Heavy real flower arrangements
• Royal sofa seating
Seating:
• Gold chiavari chairs
• Round tables with premium centerpieces
• VIP family sofa lounge
Entrance:
• Grand floral gate (roses + orchids)
• Colorful pathway carpet
• Hanging lanterns and chandeliers
Lighting:
• DMX controlled moving heads
• Pattern lighting
• LED spotlights & premium washes
Décor & Props:
• Full mehndi photo booth
• Floral swings
• Custom neon name sign
• Designer dholki corner
Food Setup:
• Luxury buffet islands
• Live food counters
• Decorated dessert section`,
  },
  Barat: {
    Low: `✅ BARAT – LOW BUDGET DESCRIPTION
Style: Simple, traditional
Stage:
• Basic stage with red/golden backdrop
• Artificial flowers
• Simple sofa
Seating:
• Basic banquet chairs
• Few tables with centerpieces
Entrance:
• Red fabric entrance
• Small flower bunches
Lighting:
• Warm white lights
• 2–3 spotlights on stage
Décor:
• Basic drapes
• Simple aisle carpet`,
    Medium: `✅ BARAT – MEDIUM BUDGET DESCRIPTION
Style: Elegant, traditional
Stage:
• Medium stage with floral backdrop
• Golden sofa set
• LED fairy curtains
Seating:
• Banquet chairs with red/gold covers
• VIP sofa for family
Entrance:
• Floral archway
• Lighted walkway
Lighting:
• Color wash lights
• Stage spotlights
• Decorative chandeliers
Décor:
• Flower stands
• Drapes and lighting accents`,
    High: `✅ BARAT – HIGH BUDGET DESCRIPTION
Style: Grand, royal, luxury setup
Stage:
• Large royal stage with heavy real flowers
• Designer golden sofa
• LED screen background
• Crystal chandeliers
Seating:
• Gold chiavari chairs
• Royal lounge seating
• Premium centerpieces (candles, roses, orchids)
Entrance:
• Huge floral gate
• Carpeted walkway with lanterns
• Hanging chandeliers
Lighting:
• DMX moving heads
• Full stage wash
• Ceiling fairy canopy
Décor:
• Luxury flower stands
• Crystal decoration
• Name monogram on stage`,
  },
  Walima: {
    Low: `✅ WALIMA – LOW BUDGET DESCRIPTION
Style: Soft, simple, elegant
Stage:
• Light pastel backdrop
• Artificial flowers
• Sofa seating
Seating:
• White chairs
• Basic tablecloths
Entrance:
• Simple white drape entrance
Lighting:
• Soft white lights
• 1–2 spotlights on stage
Décor:
• Basic flower stands`,
    Medium: `✅ WALIMA – MEDIUM BUDGET DESCRIPTION
Style: Elegant pastel theme
Stage:
• Pastel floral wall
• Ivory/golden sofa
• LED fairy lighting
Seating:
• White/gold banquet chairs
• Centerpieces with candles
Entrance:
• Floral entrance with soft colors
Lighting:
• Cool white + pastel wash lights
• Hanging fairy canopy
Décor:
• Floral runners
• Crystal stands`,
    High: `✅ WALIMA – HIGH BUDGET DESCRIPTION
Style: Luxury, dreamy, premium
Stage:
• Designer pastel floral stage
• Real roses + hydrangeas
• LED screen
• Royal white sofa
Seating:
• Gold chiavari chairs
• Premium flower centerpieces
• Round & rectangular tables
Entrance:
• Grand floral gate
• Crystal walkway decorations
• Hanging florals + chandeliers
Lighting:
• Moving heads
• Pattern lighting
• Fairy cloud canopy
Décor:
• Luxury floral tunnel
• Custom monogram
• Candle wall backdrop`,
  },
};

async function run() {
  const db = config.get('db');
  await mongoose.connect(db);
  const events = await Event.find({ type: { $in: ['Mehndi', 'Barat', 'Walima'] }, budget: { $in: ['Low', 'Medium', 'High'] } });
  let updated = 0;
  for (const e of events) {
    const t = e.type;
    const b = e.budget;
    const content = text[t] && text[t][b];
    if (!content) continue;
    e.description = content;
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