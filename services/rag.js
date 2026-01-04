// Backend/services/rag.js
// ---------------------------------------------------------
// Hybrid RAG Engine
// 1) Primary: OpenAI Embeddings (text-embedding-3-small)
// 2) Secondary fallback: Local TF-IDF (no API cost)
// ---------------------------------------------------------

const config = require("config");
const mongoose = require("mongoose");

let tfidfIndex = null;

/* ----------------------------- Tokenizer ----------------------------- */
function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/* ---------------------- Local TF-IDF Index Build ---------------------- */
function buildTFIDF(events) {
  const docs = events.map((ev) => ({
    id: String(ev._id),
    text: ev.description || "",
  }));

  const vocab = new Map();
  const tokensList = docs.map((d) => tokenize(d.text));

  tokensList.forEach((tokens) => {
    const seen = new Set();
    tokens.forEach((w) => {
      if (!vocab.has(w)) vocab.set(w, { df: 0 });
      if (!seen.has(w)) {
        vocab.get(w).df += 1;
        seen.add(w);
      }
    });
  });

  const N = docs.length || 1;
  const idf = new Map();
  for (const [w, meta] of vocab.entries()) {
    idf.set(w, Math.log((N + 1) / (meta.df + 1)) + 1);
  }

  const vectors = docs.map((d, i) => {
    const tf = new Map();
    tokensList[i].forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));

    const weights = new Map();
    let norm = 0;
    for (const [w, f] of tf.entries()) {
      const wgt = f * (idf.get(w) || 0);
      weights.set(w, wgt);
      norm += wgt * wgt;
    }

    norm = Math.sqrt(norm) || 1;
    return { id: d.id, weights, norm };
  });

  tfidfIndex = { idf, vectors };
}

/* ----------------------------- TF-IDF Embed ----------------------------- */
function embedLocal(text, idf) {
  const tokens = tokenize(text);
  const tf = new Map();
  tokens.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));

  const weights = new Map();
  let norm = 0;

  for (const [w, f] of tf.entries()) {
    const wgt = f * (idf.get(w) || 0);
    weights.set(w, wgt);
    norm += wgt * wgt;
  }

  norm = Math.sqrt(norm) || 1;
  return { weights, norm };
}

/* ----------------------------- Cosine Similarity ----------------------------- */
function cosine(a, b) {
  let sum = 0;
  for (const [w, wa] of a.weights.entries()) {
    const wb = b.weights.get(w) || 0;
    sum += wa * wb;
  }
  return sum / (a.norm * b.norm);
}

/* ------------------------ OpenAI Embedding (Primary) ------------------------ */
async function embedText(text) {
  const apiKey = process.env.OPENAI_API_KEY || (config.has("openaiApiKey") ? config.get("openaiApiKey") : null);
  if (!apiKey) return null; // force fallback mode

  const model = process.env.OPENAI_EMBEDDINGS_MODEL || (config.has("openaiEmbeddingsModel") ? config.get("openaiEmbeddingsModel") : "text-embedding-3-small");

  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: text || "" }),
    });

    const data = await res.json();
    return data?.data?.[0]?.embedding || null;
  } catch (err) {
    return null;
  }
}

/* ----------------------------- Ensure Embeddings ----------------------------- */
async function ensureEmbeddings() {
  const apiKey = process.env.OPENAI_API_KEY || (config.has("openaiApiKey") ? config.get("openaiApiKey") : null);
  if (!apiKey) return; // skip embedding build when no key
  const embedCol = mongoose.connection.collection("event_embeddings");
  const { Event } = require("../models/event");

  const events = await Event.find({}).lean();

  for (const ev of events) {
    const exists = await embedCol.findOne({ eventId: String(ev._id) });
    if (!exists) {
      const emb = await embedText(ev.description || "");
      if (emb) {
        await embedCol.insertOne({
          eventId: String(ev._id),
          embedding: emb,
          updatedAt: new Date(),
        });
      }
    }
  }
}

/* ------------------------ Hybrid Retrieve (Emb → TF-IDF) ----------------------- */
async function retrieve(query, limit = 20) {
  const apiKey = process.env.OPENAI_API_KEY || (config.has("openaiApiKey") ? config.get("openaiApiKey") : null);

  // If API key exists → use embeddings
  if (apiKey) {
    const embedCol = mongoose.connection.collection("event_embeddings");
    await ensureEmbeddings();
    const qEmb = await embedText(query);

    if (qEmb) {
      const docs = await embedCol.find().toArray();

      const scored = docs.map((d) => ({
        id: d.eventId,
        score: cosineVector(qEmb, d.embedding || []),
      }));

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map((x) => x.id);
    }
  }

  // Fallback → TF-IDF (no cost)
  const { Event } = require("../models/event");
  if (!tfidfIndex) {
    const events = await Event.find({}).limit(500);
    buildTFIDF(events);
  }

  const { idf, vectors } = tfidfIndex;
  const q = embedLocal(query, idf);

  const scored = vectors.map((v) => ({
    id: v.id,
    score: cosine(q, v),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.id);
}

/* ----------------------------- Vector Cosine for Embeddings ----------------------------- */
function cosineVector(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let s = 0, na = 0, nb = 0;
  for (let i = 0; i < len; i++) {
    const va = a[i] || 0;
    const vb = b[i] || 0;
    s += va * vb;
    na += va * va;
    nb += vb * vb;
  }

  const denom = (Math.sqrt(na) * Math.sqrt(nb)) || 1;
  return s / denom;
}

module.exports = {
  retrieve,
  ensureEmbeddings,
};
