// Backend/services/orchestrateLLM.js
// ------------------------------------------------------------
// Final Multi-Agent Orchestrator (Static + Wedding + RAG)
// ------------------------------------------------------------
const config = require("config");

const { entityExtractor } = require("./agents/entityExtractor");
const { slotManager } = require("./agents/slotManager");
const { retrievalAgent } = require("./agents/retrievalAgent");
const { composeAgent } = require("./agents/composeAgent");
const { staticCategoryAgent } = require("./agents/staticCategoryAgent");

// ------------------------------------------------------------
// Optional LLM refinement
// ------------------------------------------------------------
async function callOpenAI(messages) {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    (config.has("openaiApiKey") ? config.get("openaiApiKey") : null);

  if (!apiKey) return null;

  const model = config.has("openaiModel") ? config.get("openaiModel") : "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

// ------------------------------------------------------------
// Main Orchestrator
// ------------------------------------------------------------
async function orchestrateLLM(history, lastAsked = null) {
  // 1) Detect missing slots from full history
  const missing = slotManager(history, lastAsked);

  // 1A — If a question is needed (missing slot)
  if (missing.question) {
    const voiceOutput = makeVoiceVersion(missing.question);
    return {
      assistant: `${missing.question} [Press 1: restart, 2: previous, 0: close]`,
      assistant_voice: voiceOutput,
      options: [],
      collected: missing.fields,
      question: missing.question,
    };
  }

  // 2) STATIC CATEGORIES FIRST
  const staticTypes = ["Corporate", "Dawat", "Qawali Night", "Birthday"];
  if (missing.isStatic || staticTypes.includes(missing.fields.type)) {
    const resp = await staticCategoryAgent(missing.fields);
    const voiceOutput = makeVoiceVersion(resp.assistant);
    return {
      assistant:
        resp.assistant +
        " [Press 1: restart, 2: previous, 0: close]",
      assistant_voice: voiceOutput,
      options: resp.options || [],
      collected: missing.fields,
      question: null,
    };
  }

  // 3) Wedding pipeline → RAG retrieval
  const retrievedEvents = await retrievalAgent(missing.fields);

  // 4) Final ML ranking + message generation
  const composed = await composeAgent(missing.fields, retrievedEvents);

  // 5) Optional refinement via OpenAI
  const apiKey =
    process.env.OPENAI_API_KEY ||
    (config.has("openaiApiKey") ? config.get("openaiApiKey") : null);

  if (apiKey) {
    const refined = await callOpenAI([
      {
        role: "system",
        content:
          "Rewrite the assistant message in a warm, human-like tone. Keep sentences short. " +
          "Avoid sounding robotic or overly formal. " +
          "Assume you are a friendly event planner helping the user. " +
          "Do NOT repeat budget tiers or long details—they will appear inside cards. " +
          "The message should be clear for both text chat and voice output. " +
          "If the message gives suggestions, offer them gently.",
      },
      { role: "user", content: composed.assistant },
    ]);

    if (refined) composed.assistant = refined;
  }

  const voiceOutput = makeVoiceVersion(composed.assistant);

  return {
    assistant: composed.assistant + " [Press 1: restart, 2: previous, 0: close]",
    assistant_voice: voiceOutput,
    options: composed.options || [],
    collected: missing.fields,
    question: null,
  };
}

function makeVoiceVersion(text) {
  return String(text)
    .replace(/\[Press.*?\]/g, "")
    .replace(/Click|Tap/gi, "You can check")
    .replace(/£/g, " pounds ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { orchestrateLLM };
