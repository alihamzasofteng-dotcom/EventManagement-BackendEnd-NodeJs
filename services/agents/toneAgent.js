// Backend/services/agents/toneAgent.js
/**
 * Tone Agent
 * -----------------------------------------------------------
 * High-quality conversational templates for the assistant.
 * No logic — only message phrasing.
 */

function greetName(name) {
  return name ? `Hi ${name}, ` : "Hi there, ";
}

/* ------------------------- NAME ------------------------- */
function askName() {
  return (
    "Welcome to Graceful Events. I'm here to help you plan something amazing. " +
    "What name should I call you?"
  );
}

/* --------------------- EVENT TYPE ----------------------- */
function askEventType(name) {
  return (
    `${greetName(name)}what type of event are you looking to plan? ` +
    "You can say something like Pre-Wedding, Wedding Day, Reception, Corporate, Dawat, Qawali Night or Birthday."
  );
}

/* -------------------- WEDDING BUDGET -------------------- */
function askWeddingBudget(type, name) {
  return (
    `Great choice, ${name}. To personalise your ${type} setup, could you pick a budget tier? ` +
    "Low, Medium or High works perfectly."
  );
}

function clarifyWeddingBudget(name) {
  return (
    `${name}, just choose between Low, Medium or High so I can match the right package.`
  );
}

/* -------------------- STATIC BUDGET --------------------- */
function askStaticBudget(type, name, min) {
  return (
    `${name}, our ${type} packages usually begin around £${min}. ` +
    "Roughly how much were you hoping to spend?"
  );
}

function staticBudgetTooLow(type, name, userBudget, min) {
  return (
    `Thanks, ${name}. A budget of £${userBudget} is a bit below the usual starting point for ${type} events, which is around £${min}. ` +
    "You can still explore the standard package, or let me know if you'd like to adjust your budget."
  );
}

/* --------------------- GUEST COUNT ---------------------- */
function askGuestCount(name, type, capacityText) {
  return (
    `${name}, our ${type} setups usually work well for ${capacityText}. ` +
    "About how many guests are you expecting?"
  );
}

function guestTooMany(name, type, guests, max) {
  return (
    `${name}, ${guests} guests is above the usual limit for ${type} events, which is around ${max}. ` +
    "You can adjust the number or explore the standard package below."
  );
}

function guestTooFew(name, type, guests, min) {
  return (
    `${name}, ${type} events normally start around ${min} guests. ` +
    `You mentioned ${guests}. Could you confirm roughly how many guests you're planning for?`
  );
}

/* -------------------------- DATE ------------------------ */
function askDate(name) {
  return (
    `${name}, finally, what date or timeframe are you considering? ` +
    'For example: "12 June" or "2025-06-12".'
  );
}

function clarifyDate(name) {
  return (
    `${name}, could you confirm the date you're planning for? ` +
    'Something like "12 June" works perfectly.'
  );
}

module.exports = {
  greetName,
  askName,
  askEventType,
  askWeddingBudget,
  clarifyWeddingBudget,
  askStaticBudget,
  staticBudgetTooLow,
  askGuestCount,
  guestTooMany,
  guestTooFew,
  askDate,
  clarifyDate,
};
