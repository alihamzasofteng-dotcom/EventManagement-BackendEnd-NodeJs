// Backend/services/agents/entityExtractor.js

/**
 * Entity Extractor Agent
 * -----------------------------------
 * Extracts structured fields from user messages:
 *  - name
 *  - budget
 *  - guests
 *  - date
 *  - raw numbers
 *
 * This agent is intentionally reusable by other agents.
 */

function extractName(text = "") {
  const clean = text.trim();

  // "My name is Hamza Ali"
  const nm = clean.match(/\b(my name is|i am|this is)\s+([a-zA-Z][a-zA-Z ]{1,40})\b/i);
  if (nm) return nm[2].trim();

  // fallback: standalone name without numbers
  const looksLikeName =
    /^[A-Za-z]{2,}(\s+[A-Za-z]{2,}){0,3}$/.test(clean) &&
    !/\d/.test(clean);

  if (looksLikeName) return clean;

  return "";
}

function extractBudget(text = "") {
  const raw = text.toLowerCase();
  if (/guests?|people|persons?/.test(raw)) return null;
  if (extractDate(text)) return null;
  if (/\blow\b/.test(raw)) return "Low";
  if (/\bmedium\b/.test(raw)) return "Medium";
  if (/\bhigh\b/.test(raw)) return "High";
  const cleaned = raw.replace(/[,£$]/g, "").trim();
  const match = cleaned.match(/\b(\d{3,6})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function extractGuests(text = "") {
  const t = text.toLowerCase();

  // "120 guests" / "200 people"
  const m =
    t.match(/(\d{1,4})\s*(guests?|people|persons?)/) ||
    t.match(/(guests?|people|persons?)\s*(of|about|around)?\s*(\d{1,4})/);

  if (m) return parseInt(m[1] || m[3], 10);

  // No keyword → do not treat random numbers as guest counts
  return null;
}

function extractDate(text = "") {
  const t = text.toLowerCase();
  if (/\b(guests?|people|persons?)\b/.test(t)) return "";
  const m = text.match(
    /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)|\d{1,2}\s*(january|february|march|april|may|june|july|august|september|october|november|december)|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{1,2})\b/i
  );
  return m ? m[1] : "";
}

function extract(text = "") {
  return {
    name: extractName(text),
    budget: extractBudget(text),
    guests: extractGuests(text),
    date: extractDate(text),
  };
}

module.exports = {
  extract,
  extractName,
  extractBudget,
  extractGuests,
  extractDate,
};
