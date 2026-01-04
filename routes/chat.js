// Backend/routes/chat.js
// ------------------------------------------------------------
// Multi-Agent Chat Route (Step-by-Step Form Filling + LLM RAG)
// ------------------------------------------------------------
const express = require("express");
const router = express.Router();

const { orchestrateLLM } = require("../services/orchestrateLLM");

// ------------------------------------------------------------
// POST /api/chat
// ------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { history = [], lastAsked = null } = req.body;

    // Last user message
    const lastUser = [...history].reverse().find((t) => t.role === "user");
    const cmd = lastUser?.content?.trim() || "";

    // Commands
    if (cmd === "1") {
      return res.send({
        assistant:
          "Restarting chat. Welcome to Graceful Events. May I know your name? [Press 1: restart, 2: previous, 0: close]",
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
          "Closing chat. You can reopen anytime from the bottom-left icon. [Press 1: restart, 2: previous, 0: close]",
        options: [],
      });
    }

    // "2" means go back one step
    if (cmd === "2") {
      return res.send({
        assistant:
          "Previous question reinstated. Please answer again. [Press 1: restart, 2: previous, 0: close]",
        options: [],
      });
    }

    // "9" restart current step only
    if (cmd === "9") {
      const before = [...history].reverse().find((t) => t.role === "assistant");
      const text = before?.content || "Let's try that again.";
      return res.send({
        assistant: "No problem — let's try that again. " + text,
        options: [],
        restartStep: true,
      });
    }

    // MAIN multi-agent pipeline
    const output = await orchestrateLLM(history, lastAsked);

    return res.send({
      assistant: output.assistant,
      assistant_voice: output.assistant_voice,
      options: output.options || [],
      collected: output.collected || {},
      lastAsked: output.question || lastAsked,
    });
  } catch (err) {
    console.error("Chat Route Error:", err);
    res.send({
      assistant: "There was a system issue. Please try again.",
      options: [],
    });
  }
});

module.exports = router;
