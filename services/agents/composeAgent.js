// Backend/services/agents/composeAgent.js
// --------------------------------------------------------
// SAFE Composer Agent - handles missing DB fields, no crashes
// --------------------------------------------------------

const { formatPrice } = require("../tools");
const { train, scoreEvent } = require("../recommender");

function safePrice(e, fields) {
  try {
    return formatPrice(e.type, fields.budget, e.priceRange);
  } catch {
    return "Price varies by package";
  }
}

function safeCapacity(e) {
  try {
    if (e.peopleRange?.minPeople && e.peopleRange?.maxPeople) {
      return `${e.peopleRange.minPeople}–${e.peopleRange.maxPeople}`;
    }
  } catch {}

  return "3–500";
}

async function composeAgent(fields, events) {
  await train();

  const g = fields.guests ? parseInt(fields.guests, 10) : null;

  const cleaned = events.filter(
    (e) =>
      e &&
      typeof e === "object" &&
      e.name &&
      e.type &&
      e.peopleRange &&
      typeof e.peopleRange.minPeople === "number" &&
      typeof e.peopleRange.maxPeople === "number"
  );
  const source = cleaned.length ? cleaned : events;

  // SAFELY FILTER EVENTS FOR CAPACITY
  const strict = g
    ? source.filter((e) => {
        try {
          return (
            e.peopleRange &&
            typeof e.peopleRange.minPeople === "number" &&
            typeof e.peopleRange.maxPeople === "number" &&
            g >= e.peopleRange.minPeople &&
            g <= e.peopleRange.maxPeople
          );
        } catch {
          return false;
        }
      })
    : source;

  const pool = strict.length ? strict : source;

  // SAFELY SCORE EVENTS
  const ranked = pool
    .map((e) => ({ e, s: scoreEvent(e, fields, 0) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.e);

  const top = ranked.slice(0, 3);

  const options = top.map((e) => ({
    name: e.name || "Event package",
    category: e.type || fields.type,
    approx_cost: safePrice(e, fields),
    capacity: safeCapacity(e),
    description: e.description || "Details available on the event page.",
    link: e.slug ? `/events/${e.slug}` : `/events/${e._id}`,
    images: Array.isArray(e.images) ? e.images : []
  }));

  const assistant = top.length
    ? strict.length
      ? "Here are the best-matching packages based on your details."
      : "Capacity exceeded — suggesting nearest packages in your type/budget."
    : "No matches were found. Adjust budget, type, or guests for better results.";

  return { assistant, options };
}

module.exports = { composeAgent };
