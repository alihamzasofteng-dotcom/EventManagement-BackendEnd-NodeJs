// Backend/services/recommender.js
// -------------------------------------------------------------
// ML Ranking Engine for Events
// Scores events based on:
// - Type match
// - Budget match (wedding only)
// - Capacity fit (guest count)
// - Popularity (from bookings)
// -------------------------------------------------------------

const mongoose = require("mongoose");

// Default weights
let weights = {
  typeMatch: 1.2,
  budgetMatch: 1.2,
  capacityFit: 1.1,
  popularity: 1.0,
};

// -------------------------------------------------------------
// TRAIN — learns weights from past bookings
// -------------------------------------------------------------
async function train() {
  try {
    const col = mongoose.connection.collection("bookings");
    const cursor = col.find({}).limit(5000);

    const popularityCount = new Map();

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const key = String(doc.eventId);

      popularityCount.set(key, (popularityCount.get(key) || 0) + 1);
    }

    const total = [...popularityCount.values()].reduce((a, b) => a + b, 0);

    weights = {
      typeMatch: 1.2,
      budgetMatch: 1.2,
      capacityFit: 1.1,
      popularity: 1 + Math.log(1 + total / 1000),
    };
  } catch (err) {
    console.error("Recommender training error:", err);
    weights = {
      typeMatch: 1,
      budgetMatch: 1,
      capacityFit: 1,
      popularity: 1,
    };
  }
}

// -------------------------------------------------------------
// SCORE EVENT
// -------------------------------------------------------------
function scoreEvent(event, fields, popularityCount = 0) {
  if (!event || typeof event !== "object") return 0;
  let score = 0;

  const userType = fields.type;
  const userBudget = fields.budget;
  const userGuests = fields.guests ? parseInt(fields.guests, 10) : null;

  // Type match bonus
  if (event.type && event.type === userType) {
    score += weights.typeMatch;
  }

  // Budget match (wedding types ONLY)
  if (
    ["Mehndi", "Barat", "Walima"].includes(userType) &&
    userBudget &&
    event.budget &&
    userBudget === event.budget
  ) {
    score += weights.budgetMatch;
  }

  // Capacity fit bonus
  if (
    userGuests &&
    event.peopleRange &&
    typeof event.peopleRange.minPeople === "number" &&
    typeof event.peopleRange.maxPeople === "number"
  ) {
    if (
      userGuests >= event.peopleRange.minPeople &&
      userGuests <= event.peopleRange.maxPeople
    ) {
      score += weights.capacityFit;
    }
  }

  // Popularity effect
  score += weights.popularity * (popularityCount || 0);

  return score;
}

module.exports = {
  train,
  scoreEvent,
};
