// Backend/services/agents/retrievalAgent.js
// --------------------------------------------------------
// Retrieval Agent (Hybrid RAG → Embeddings + TF-IDF fallback)
// --------------------------------------------------------

const { retrieve } = require("../rag");
const { getEvents } = require("../tools");

async function retrievalAgent(fields) {
  const q =
    `${fields.type || ""} ` +
    `${fields.budget || ""} ` +
    `${fields.guests || ""} ` +
    `${fields.date || ""}`.trim();

  const ids = await retrieve(q, 20);
  const strict = await getEvents(fields);
  const relaxed = await getEvents({ type: fields.type, budget: fields.budget });
  const typeOnly = await getEvents({ type: fields.type });

  const base = [...strict, ...relaxed, ...typeOnly].filter(
    (e, i, arr) => arr.findIndex((x) => String(x._id) === String(e._id)) === i
  );

  const map = new Map(base.map((e) => [String(e._id), e]));
  const matched = ids.map((id) => map.get(id)).filter(Boolean);

  const merged = [...matched, ...base].filter(
    (e, i, arr) => arr.findIndex((x) => String(x._id) === String(e._id)) === i
  );

  return merged;
}

module.exports = { retrievalAgent };
