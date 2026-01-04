// Backend/startup/routes.js
// ---------------------------------------------------------
// Global Express Route Loader for Full Backend
// ---------------------------------------------------------

const express = require("express");
const cors = require("cors");
const path = require("path");

// Middlewares
const error = require("../middlewares/error");

// Your existing domain routes
const genres = require("../routes/genres");
const movies = require("../routes/movies");
const users = require("../routes/users");
const auth = require("../routes/auth");
const customers = require("../routes/customers");
const rentals = require("../routes/rentals");
const returns = require("../routes/returns");
const about = require("../routes/about");
const subservices = require("../routes/subservices");
const services = require("../routes/services");
const subcategories = require("../routes/subcategories");
const categories = require("../routes/categories");
const navbar = require("../routes/navbar");

// Event + AI routes
const events = require("../routes/events");
const chat = require("../routes/chat");     // NEW multi-agent chat
const voice = require("../routes/voice");   // NEW multi-agent voice

// ---------------------------------------------------------

module.exports = function (app) {
  /* ---------------------------
      CORE MIDDLEWARE
  ---------------------------- */
  app.use(express.json({ limit: "10mb" }));
  app.use(cors());

  /* ---------------------------
      API ROUTES
  ---------------------------- */

  app.use("/api/genres", genres);
  app.use("/api/movies", movies);
  app.use("/api/customers", customers);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/returns", returns);
  app.use("/api/about", about);
  app.use("/api/subservices", subservices);
  app.use("/api/services", services);
  app.use("/api/subcategories", subcategories);
  app.use("/api/categories", categories);
  app.use("/api/navbar", navbar);

  // Event & AI routes
  app.use("/api/events", events);
  app.use("/api/chat", chat);
  app.use("/api/voice", voice);

  /* ---------------------------
      STATIC FILES (Images)
  ---------------------------- */

  // Serve /public/images as /images
  app.use(
    "/images",
    express.static(path.join(__dirname, "..", "public", "images"))
  );

  /* ---------------------------
      ERROR HANDLER (MUST BE LAST)
  ---------------------------- */
  app.use(error);
};
