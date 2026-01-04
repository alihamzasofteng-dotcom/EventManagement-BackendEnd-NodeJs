// Backend/services/agents/guestAgent.js

const { WEDDING_TYPES, STATIC_TYPES } = require("./intentAgent");

const STATIC_GUEST_LIMITS = {
  Corporate: { min: 3, max: 2000 },
  Dawat: { min: 3, max: 2000 },
  "Qawali Night": { min: 3, max: 1500 },
  Birthday: { min: 3, max: 1000 },
};

function extractGuests(text = "") {
  const t = text.toLowerCase().trim();

  let m =
    t.match(/(\d{1,4})\s*(guests?|people|persons?)/) ||
    t.match(/(guests?|people|persons?)\s*(of|around|about|approx)?\s*(\d{1,4})/);

  if (m) return parseInt(m[1] || m[3], 10);

  const raw = t.match(/\b(\d{1,4})\b/);
  return raw ? parseInt(raw[1], 10) : null;
}

function guestAgent(type, userMessage) {
  const num = extractGuests(userMessage);
  if (!num) return { valid: false, reason: "not-numeric", numericGuests: null };

  if (STATIC_TYPES.includes(type)) {
    const limits = STATIC_GUEST_LIMITS[type];
    if (!limits) return { valid: true, numericGuests: num };

    if (num < limits.min)
      return {
        valid: false,
        reason: "too-few",
        numericGuests: num,
        min: limits.min,
        max: limits.max,
      };

    if (num > limits.max)
      return {
        valid: false,
        reason: "too-many",
        numericGuests: num,
        min: limits.min,
        max: limits.max,
      };

    return { valid: true, numericGuests: num, min: limits.min, max: limits.max };
  }

  if (WEDDING_TYPES.includes(type)) {
    return { valid: true, numericGuests: num };
  }

  return { valid: true, numericGuests: num };
}

module.exports = { guestAgent, extractGuests, STATIC_GUEST_LIMITS };
