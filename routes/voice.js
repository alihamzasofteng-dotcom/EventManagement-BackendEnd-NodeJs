// Backend/routes/voice.js
// ------------------------------------------------------------
// Multi-Agent Voice Route (Speech → Intent → Pipeline)
// ------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { orchestrateLLM } = require("../services/orchestrateLLM");

// ------------------------------------------------------------
// POST /api/voice
// Body:
//   history: [ {role:"user", content:"..."}, ... ]
// ------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { history = [] } = req.body;

    // Extract last user transcript
    const lastUser = [...history].reverse().find((t) => t.role === "user");
    const cmd = lastUser?.content?.trim() || "";

    // ---- Standard Commands ----
    if (cmd === "1") {
      return res.send({
        assistant:
          "Restarting voice session. Welcome to Graceful Events. May I know your name? [Press 1: restart, 2: previous, 0: close]",
        collected: {
          name: "",
          type: "",
          budget: "",
          guests: "",
          date: "",
        },
        options: [],
        reset: true,
      });
    }

    if (cmd === "0") {
      return res.send({
        assistant:
          "Voice session closed. You may restart anytime. [Press 1: restart, 2: previous, 0: close]",
        options: [],
      });
    }

    if (cmd === "2") {
      return res.send({
        assistant:
          "Returning to the previous question. Please answer again. [Press 1: restart, 2: previous, 0: close]",
        options: [],
      });
    }

    // ---- MAIN MULTI-AGENT PIPELINE ----
    const output = await orchestrateLLM(history);

    return res.send({
      assistant: output.assistant,
      assistant_voice: output.assistant_voice,
      say: output.assistant_voice,
      options: output.options || [],
      collected: output.collected || {},
      lastAsked: output.question || null,
    });
  } catch (err) {
    console.error("Voice Route Error:", err);
    res.status(500).send({
      assistant: "There was a system issue. Please try again.",
      options: [],
    });
  }
});

module.exports = router;
