// Backend/services/agents/slotManager.js

const { detectIntent, WEDDING_TYPES, STATIC_TYPES } = require("./intentAgent");
const { extract } = require("./entityExtractor");
const { budgetAgent } = require("./budgetAgent");
const { guestAgent } = require("./guestAgent");
const tone = require("./toneAgent");

function mergeFields(oldFields, newFields) {
  return {
    name: oldFields.name || newFields.name,
    type: oldFields.type || newFields.type,
    budget: oldFields.budget || ( ["Low","Medium","High"].includes(newFields.budget) ? newFields.budget : "" ),
    guests: oldFields.guests || newFields.guests,
    date: oldFields.date || newFields.date,
  };
}

function slotManager(history = [], lastAsked = null) {
  let fields = { name: "", type: "", budget: "", guests: "", date: "" };

  // Extract user info from all history
  for (const turn of history) {
    if (turn.role !== "user") continue;

    fields = mergeFields(fields, extract(turn.content));

    const intent = detectIntent(turn.content);
    if (intent.known && !fields.type) fields.type = intent.type;
  }

  const lastUser = history.filter(t => t.role === "user").slice(-1)[0];
  const lastMessage = lastUser?.content || "";
  const lastAssistant = history.filter(t => t.role === "assistant").slice(-1)[0];
  const lastAskedText = lastAssistant?.content || "";
  const name = fields.name || "there";

  const isWedding = WEDDING_TYPES.includes(fields.type);
  const isStatic = STATIC_TYPES.includes(fields.type);

  let historyBudget = null;
  for (const turn of history) {
    if (turn.role === "user") {
      const bx = budgetAgent(fields.type, turn.content || "");
      if (bx.valid && bx.tier) historyBudget = bx.tier;
    }
  }

  // For weddings, ignore any numeric budget accidentally picked from guest/date replies
  if (isWedding) {
    if (!["Low", "Medium", "High"].includes(fields.budget)) {
      fields.budget = historyBudget || "";
    }
  }

  if (isWedding && /guests/i.test(lastAskedText) && historyBudget) {
    fields.budget = historyBudget;
  }

  // Recover guest count from history: if an assistant asked guests, use the next user's reply
  if (!fields.guests) {
    for (let i = 0; i < history.length - 1; i++) {
      const hA = history[i];
      const hU = history[i + 1];
      if (hA.role === "assistant" && /guests/i.test(hA.content || "") && hU && hU.role === "user") {
        const g = guestAgent(fields.type, hU.content || "");
        if (g.valid && g.numericGuests) {
          fields.guests = g.numericGuests;
          break;
        }
      }
    }
  }

  // ----------------------------------------------------------
  // 1) Ask NAME
  // ----------------------------------------------------------
  if (!fields.name) {
    return { fields, question: tone.askName() };
  }

  // ----------------------------------------------------------
  // 2) Ask EVENT TYPE
  // ----------------------------------------------------------
  if (!fields.type) {
    return { fields, question: tone.askEventType(name) };
  }

  // ----------------------------------------------------------
  // 3) WEDDING → Low/Medium/High
  //   Only reassess when budget was the last asked topic
  // ----------------------------------------------------------
  if (isWedding) {
    const askedGuests = /guests/i.test(lastAskedText);
    const askedDate = /date|timeframe/i.test(lastAskedText);
    if (!(askedDate || askedGuests)) {
      const b = budgetAgent(fields.type, lastMessage);
      if (!fields.budget) {
        if (b.valid && b.tier) fields.budget = b.tier;
        else if (historyBudget) fields.budget = historyBudget;
        else return { fields, question: tone.askWeddingBudget(fields.type, name) };
      }
      if (!["Low", "Medium", "High"].includes(fields.budget)) {
        fields.budget = "";
        return { fields, question: tone.clarifyWeddingBudget(name) };
      }
    }
  }

  // ----------------------------------------------------------
  // 4) STATIC TYPE BUDGET (Corporate, Dawat, etc.)
  // ----------------------------------------------------------
  if (isStatic) {
    const min = {
      Corporate: 2000,
      Dawat: 1000,
      "Qawali Night": 1000,
      Birthday: 1000,
    }[fields.type];

    const b = budgetAgent(fields.type, lastMessage);

    // FIRST TIME budget ask
    if (!fields.budget) {
      return {
        fields,
        question: `${name}, our ${fields.type} events usually start from around £${min}. What’s your approximate total budget?`,
      };
    }

    // USER ENTERED NON-NUMERIC TEXT
    if (!b.valid && b.reason === "not-numeric") {
      return {
        fields,
        question: `${name}, just a rough number is enough — for example £${min}, 2500 or 3000. What’s your approximate budget?`,
      };
    }

    // USER ENTERED BELOW MINIMUM
    if (b.tooLow) {
      fields.budget = b.numeric;
      return {
        fields,
        question: `${name}, thank you. ${fields.type} events usually begin around £${min}, so £${b.numeric} is slightly low. I can still show you our standard package — would you like to continue?`,
      };
    }

    // VALID BUDGET
    fields.budget = b.numeric;
  }

  // ----------------------------------------------------------
  // 5) AUTOFIX GUEST INPUT (if last question was guests)
  // ----------------------------------------------------------
  if (/guests/i.test(lastAskedText) && !fields.guests) {
    const gAuto = guestAgent(fields.type, lastMessage);
    if (gAuto.valid) fields.guests = gAuto.numericGuests;
  }

  // ----------------------------------------------------------
  // 6) ASK GUESTS
  // ----------------------------------------------------------
  if (!fields.guests) {
    const capacity = {
      Corporate: "3–2000 guests",
      Dawat: "3–2000 guests",
      "Qawali Night": "3–1500 guests",
      Birthday: "3–1000 guests",
    }[fields.type];

    if (isStatic) {
      return {
        fields,
        question: tone.askGuestCount(name, fields.type, capacity),
      };
    }

    return {
      fields,
      question: `How many guests are you expecting, ${name}?`,
    };
  }

  // ----------------------------------------------------------
  // 7) VALIDATE STATIC GUEST LIMITS ONLY ONCE
  // ----------------------------------------------------------
  if (isStatic && !fields._staticGuestsValidated) {
    const g = guestAgent(fields.type, lastMessage);

    if (!g.valid && g.reason === "too-many") {
      return {
        fields,
        question: tone.guestTooMany(name, fields.type, g.numericGuests, g.max),
      };
    }

    if (!g.valid && g.reason === "too-few") {
      return {
        fields,
        question: tone.guestTooFew(name, fields.type, g.numericGuests, g.min),
      };
    }

    fields._staticGuestsValidated = true;
  }

  // ----------------------------------------------------------
  // 8) WEDDING DATE
  // ----------------------------------------------------------
  if (isWedding && !fields.date) {
    return { fields, question: tone.askDate(name) };
  }

  if (isWedding && fields.date.length < 3) {
    return { fields, question: tone.clarifyDate(name) };
  }

  // ----------------------------------------------------------
  // ✔ ALL DONE
  // ----------------------------------------------------------
  return { fields, question: "", isStatic };
}

module.exports = { slotManager };
