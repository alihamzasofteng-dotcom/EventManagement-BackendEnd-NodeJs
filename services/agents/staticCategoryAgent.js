// Backend/services/agents/staticCategoryAgent.js
// -------------------------------------------------------------
// Static Category Agent (Corporate, Dawat, Qawali Night, Birthday)
// No RAG or ML ranking — always return ONE predefined package
// -------------------------------------------------------------

const STATIC_DATA = {
  Corporate: {
    name: "Corporate Event Package",
    description:
      "Professional corporate setups for conferences, launches, seminars and annual dinners, including stage, LED wall, branding, lights and complete catering.",
    minBudget: 2000,
    approx_cost: "Starting from £2000",
    capacity: "3–2000 guests",
    link: "/corporate-functions",
    images: [],
  },

  Dawat: {
    name: "Dawat / Family Gathering",
    description:
      "Warm and elegant family gatherings with buffet catering, neat seating and traditional decor.",
    minBudget: 1000,
    approx_cost: "Starting from £1000",
    capacity: "3–2000 guests",
    link: "/dawat",
    images: [],
  },

  "Qawali Night": {
    name: "Qawali Night",
    description:
      "Cultural Qawali nights featuring decorated artist stage, tuned sound, warm lighting and traditional ambience.",
    minBudget: 1000,
    approx_cost: "Starting from £1000",
    capacity: "3–1500 guests",
    link: "/qawali-nights",
    images: [],
  },

  Birthday: {
    name: "Birthday Celebration",
    description:
      "Colourful birthday packages with customised decor, cake table styling, LED name display and complete catering.",
    minBudget: 1000,
    approx_cost: "Starting from £1000",
    capacity: "3–1000 guests",
    link: "/birthday",
    images: [],
  },
};

async function staticCategoryAgent(fields) {
  const cfg = STATIC_DATA[fields.type];

  if (!cfg) {
    return {
      assistant: `We do offer ${fields.type} events, but no predefined package is saved yet. Please contact us for a custom quote.`,
      options: [],
    };
  }

  const budgetMsg =
    fields.budget < cfg.minBudget
      ? `Your budget (£${fields.budget}) is slightly below the typical starting range (£${cfg.minBudget}). Here is our standard package:`
      : `Here’s a suitable ${fields.type} package based on your budget of £${fields.budget}.`;

  const assistant =
    `${budgetMsg} You can tap the card to view full details or reach out to customise the experience.`;


  const option = {
    name: cfg.name,
    category: fields.type,
    approx_cost: cfg.approx_cost,
    capacity: cfg.capacity,
    description: cfg.description,
    link: cfg.link,  // ⭐ correct static link
    images: cfg.images,
    static_page: true,
    contact_link: "/contact-us",
  };

  return {
    assistant,
    options: [option],
  };
}

module.exports = { staticCategoryAgent };
