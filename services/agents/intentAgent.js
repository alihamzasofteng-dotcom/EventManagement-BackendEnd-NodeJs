// Backend/services/agents/intentAgent.js

/**
 * Intent Agent
 * -----------------------------
 * Responsible for detecting which event type the user means:
 * - Mehndi / Pre-Wedding
 * - Barat / Wedding Day
 * - Walima / Reception
 * - Corporate
 * - Dawat
 * - Qawali Night
 * - Birthday
 */

const WEDDING_TYPES = ["Mehndi", "Barat", "Walima"];
const STATIC_TYPES = ["Corporate", "Dawat", "Qawali Night", "Birthday"];

/**
 * Normalizes user input into one of the valid event types.
 */
function normalizeType(input = "") {
  const t = input.toLowerCase().trim().replace(/\s+/g, " ");

  if (t.includes("mehndi") || t.includes("pre wedding") || t.includes("pre-wedding"))
    return "Mehndi";

  if (t.includes("barat") || t.includes("wedding day"))
    return "Barat";

  if (t.includes("walima") || t.includes("reception"))
    return "Walima";

  if (t.includes("corporate"))
    return "Corporate";

  if (t.includes("dawat"))
    return "Dawat";

  if (t.includes("qawali") || t.includes("qawwali"))
    return "Qawali Night";

  if (t.includes("birthday") || t.includes("birth day"))
    return "Birthday";

  return ""; // unknown
}

/**
 * Determines type category information
 */
function detectIntent(userMessage) {
  const type = normalizeType(userMessage);

  return {
    type,
    isWedding: WEDDING_TYPES.includes(type),
    isStatic: STATIC_TYPES.includes(type),
    known: !!type
  };
}

module.exports = {
  detectIntent,
  normalizeType,
  WEDDING_TYPES,
  STATIC_TYPES
};
