const validateObjectId = require("../middleware/validateObjectId");
const { authenticate, authorize } = require("../middleware/auth"); // Corrected import
const admin = require("../middleware/admin");
const { Genre, validate } = require("../models/genre");
const express = require("express");
const router = express.Router();

// GET all genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find()
      .select("-__v")
      .sort("name");
    res.send(genres);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// POST a new genre
router.post("/", authenticate, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();

    res.send(genre);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// PUT (update) a genre
router.put("/:id", [authenticate, validateObjectId], async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// DELETE a genre
router.delete("/:id", [authenticate, admin, validateObjectId], async (req, res) => {
  try {
    const genre = await Genre.findByIdAndRemove(req.params.id);

    if (!genre) {
      return res.status(404).send("The genre with the given ID was not found.");
    }

    res.send(genre);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// GET a single genre by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id).select("-__v");

    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
