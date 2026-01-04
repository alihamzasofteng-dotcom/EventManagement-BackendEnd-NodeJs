// Backend/services/agents/budgetAgent.js

const { WEDDING_TYPES, STATIC_TYPES } = require("./intentAgent");

const STATIC_MIN_BUDGET = {
  Corporate: 2000,
  Dawat: 1000,
  "Qawali Night": 1000,
  Birthday: 1000,
};

function normaliseBudgetTier(text = "") {
  const t = text.toLowerCase();
  if (/\b(low|basic|starter|economy)\b/.test(t)) return "Low";
  if (/\b(medium|mid|standard|normal|average)\b/.test(t)) return "Medium";
  if (/\b(high|premium|luxury|vip|deluxe)\b/.test(t)) return "High";
  return null;
}

function extractNumericBudget(text = "") {
  const clean = text.toLowerCase().replace(/[,£$]/g, "").trim();
  const m = clean.match(/\b(\d{3,6})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function validateStaticBudget(type, numericBudget) {
  const min = STATIC_MIN_BUDGET[type] || 0;
  if (numericBudget < min)
    return { valid: false, tooLow: true, minRequired: min, numeric: numericBudget };
  return { valid: true, tooLow: false, minRequired: min, numeric: numericBudget };
}

function budgetAgent(type, text) {
  if (!text) return { valid: false };

  if (WEDDING_TYPES.includes(type)) {
    const tier = normaliseBudgetTier(text);
    if (!tier) return { valid: false, reason: "invalid-tier" };
    return { valid: true, tier };
  }

  if (STATIC_TYPES.includes(type)) {
    const num = extractNumericBudget(text);
    if (!num) {
      return { isStatic: true, valid: false, reason: "not-numeric", ignore: true };
    }

    const check = validateStaticBudget(type, num);
    return {
      isStatic: true,
      numeric: num,
      valid: check.valid,
      tooLow: check.tooLow,
      minRequired: check.minRequired,
      reason: check.tooLow ? "below-min" : "ok",
    };
  }

  return { valid: false, reason: "unknown-type" };
}

module.exports = { budgetAgent, extractNumericBudget, normaliseBudgetTier, STATIC_MIN_BUDGET };
