// Backend/services/tools.js
//-------------------------------------------------------
// Shared helper functions for:
// - Pricing formatting
// - Filtering events
// - Static vs Wedding category logic
//-------------------------------------------------------

const { Event } = require("../models/event");

// -------------------------------------------------------
// FORMAT PRICE
// -------------------------------------------------------
function formatPrice(type, budget, priceRange) {
  // If DB has price range (wedding types)
  if (priceRange && priceRange.minPrice && priceRange.maxPrice) {
    return `£${priceRange.minPrice}–£${priceRange.maxPrice}`;
  }

  // Static categories → single "Starting from"
  const t = (type || "").toLowerCase();

  if (t === "corporate") return "Starting from £2000";
  if (t === "dawat") return "Starting from £1000";
  if (t === "qawali night") return "Starting from £1000";
  if (t === "birthday") return "Starting from £1000";

  // Fallback generic
  return "£1000+";
}

// -------------------------------------------------------
// GET EVENTS (Wedding + Static logic)
// -------------------------------------------------------
async function getEvents(params) {
  const q = {};
  let { type, budget, guests } = params;

  const t = (type || "").toLowerCase();
  const isWedding = ["mehndi", "barat", "walima"].includes(t);

  // Always filter by event type
  if (type) q.type = type;

  // Budget allowed only for wedding types
  if (isWedding && budget) q.budget = budget;

  // For static categories (Corporate, Dawat, Qawali Night, Birthday)
  // → Never match budget
  if (!isWedding && q.budget) delete q.budget;

  // Fetch events
  let events = await Event.find(q).limit(50);

  // Guests filter
  if (guests) {
    const g = parseInt(guests, 10);

    events = events.filter((e) => {
      if (!e.peopleRange || isNaN(g)) return true;

      const { minPeople, maxPeople } = e.peopleRange;

      if (typeof minPeople === "number" && g < minPeople) return false;
      if (typeof maxPeople === "number" && g > maxPeople) return false;

      return true;
    });
  }

  return events;
}

module.exports = {
  formatPrice,
  getEvents,
};
