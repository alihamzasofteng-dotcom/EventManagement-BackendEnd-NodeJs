// Backend/services/agents.js
const { getEvents, formatPrice } = require('./tools');
const { retrieve } = require('./rag');
const { train, scoreEvent } = require('./recommender');

function mapType(input) {
  const raw = (input || '').toLowerCase();
  const t = raw.replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, ' ').trim();
  const compact = t.replace(/[-\s]/g, '');
  if (t.includes('mehndi') || t.includes('pre-wedding') || t.includes('pre wedding') || compact.includes('prewedding')) return 'Mehndi';
  if (t.includes('barat') || t.includes('wedding day')) return 'Barat';
  if (t.includes('walima') || t.includes('reception')) return 'Walima';
  if (t.includes('corporate')) return 'Corporate';
  if (t.includes('dawat')) return 'Dawat';
  if (t.includes('qawali night') || t.includes('qawali')) return 'Qawali Night';
  if (t.includes('birthday') || t.includes('birth day')) return 'Birthday';
  return input || '';
}

function extract(text) {
  const t0 = (text || '').toLowerCase();
  const t = t0
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let type = '';
  let budget = '';
  let date = '';
  let guests = '';
  let name = '';

  const typeKeywords = [
    'mehndi',
    'pre-wedding',
    'pre wedding',
    'prewedding',
    'barat',
    'wedding day',
    'walima',
    'reception',
    'corporate',
    'dawat',
    'qawali night',
    'qawali',
    'birthday',
    'birth day',
  ];
  for (const k of typeKeywords) {
    if (t.includes(k)) {
      type = mapType(k);
      break;
    }
  }

  // Wedding-style budget tiers
  if (/\b(low|lower|basic|economy)\b/.test(t)) budget = 'Low';
  else if (/\b(medium|mid|standard|average|normal)\b/.test(t)) budget = 'Medium';
  else if (/\b(high|premium|luxury|luxurious)\b/.test(t)) budget = 'High';

  // Numeric budget (e.g. "£1500" or "budget 1500")
  let numericBudgetFromThisMsg = false;
  if (!budget) {
    const currencyMatch = t0.match(/£\s*(\d{3,6})\b/);
    if (currencyMatch) {
      budget = currencyMatch[1];
      numericBudgetFromThisMsg = true;
    } else if (t0.includes('budget')) {
      const budgetNumMatch = t0.match(/budget[^0-9]{0,15}(\d{3,6})\b/);
      if (budgetNumMatch) {
        budget = budgetNumMatch[1];
        numericBudgetFromThisMsg = true;
      }
    }
  }

  // Guests: "<number> guests/people"
  let gm =
    t.match(/\b(\d{1,4})\s*(guests?|people|persons?)\b/) ||
    t.match(
      /\b(guests?|people|persons?)\s*(of|around|about|approximately|approx)?\s*(\d{1,4})\b/
    );
  if (gm) {
    guests = gm[1] || gm[4] || '';
  }

  // Fallback guests (avoid reusing numeric budget)
  if (!guests && !numericBudgetFromThisMsg) {
    const gm2 = t.match(/\b(\d{1,4})\b/);
    if (gm2) guests = gm2[1];
  }

  // Date
  const d = t.match(
    /\b(\d{1,2}\s*[a-zA-Z]+|[a-zA-Z]+\s*\d{1,2}|\d{4}-\d{2}-\d{2})\b/
  );
  if (d) date = d[1];

  // Name (from original text)
  const nameMatch = (text || '').match(
    /\b(my name is|i am|this is)\s+([a-zA-Z][a-zA-Z ]{1,40})\b/i
  );
  if (nameMatch) name = nameMatch[2].trim();

  if (!name) {
    const onlyLetters = /^([a-zA-Z]+\s*[a-zA-Z]*){1,4}$/;
    const trimmedOriginal = (text || '').trim();
    const looksLikeName =
      onlyLetters.test(trimmedOriginal) &&
      !typeKeywords.some(k => t.includes(k)) &&
      !/(low|medium|high|guest|guests|people|date|\d)/.test(t);
    if (looksLikeName) name = trimmedOriginal;
  }

  return { type, budget, guests, date, name };
}

async function collectAgent(history) {
  let fields = { name: '', date: '', budget: '', type: '', guests: '' };
  for (const turn of history) {
    if (turn.role === 'user' && turn.content) {
      const ext = extract(turn.content);
      fields = {
        name: fields.name || ext.name,
        date: fields.date || ext.date,
        budget: fields.budget || ext.budget,
        type: fields.type || ext.type,
        guests: fields.guests || ext.guests,
      };
    }
  }
  return fields;
}

async function retrievalAgent(fields) {
  const queryText = `${fields.type || ''} ${fields.budget || ''} ${fields.guests || ''}`.trim();
  const ids = await retrieve(queryText, 20);
  const base = await getEvents(fields);
  const byId = new Map(base.map(e => [String(e._id), e]));
  const combined = ids.map(id => byId.get(id)).filter(Boolean);
  const merged = [...combined, ...base].filter(
    (e, i, arr) => arr.findIndex(x => String(x._id) === String(e._id)) === i
  );
  return merged;
}

async function composerAgent(fields, events) {
  await train();
  const scored = events.map(e => ({ e, s: scoreEvent(e, fields, 0) }));
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 3).map(({ e }) => ({
    name: e.name,
    category: e.type,
    price_tier: e.budget || fields.budget || null,
    approx_cost: formatPrice(e.type, e.budget || fields.budget, e.priceRange),
    capacity:
      e.peopleRange &&
      e.peopleRange.minPeople &&
      e.peopleRange.maxPeople
        ? `${e.peopleRange.minPeople}–${e.peopleRange.maxPeople}`
        : '3–500',
    available_dates: e.availability ? [e.availability.days] : [],
    description: e.description,
    link: `/events/${e._id}`,
  }));
  const msg = top.length
    ? 'Here are personalized recommendations based on your inputs.'
    : 'No matches were found. Adjust budget, type, or guests for better results.';
  return { assistant: msg, options: top };
}

async function orchestrate(history) {
  const fields = await collectAgent(history);
  const events = await retrievalAgent(fields);
  const out = await composerAgent(fields, events);
  return { assistant: out.assistant, options: out.options, collected: fields };
}

module.exports = { orchestrate, collectAgent };
