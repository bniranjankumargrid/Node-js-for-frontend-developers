const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Exercise = require("../models/exercise.model");

router.get("/:_id/logs", async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let logs = await Exercise.findByUserId(_id);

    if (from) {
      const fromDate = new Date(from);
      logs = logs.filter((log) => new Date(log.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      logs = logs.filter((log) => new Date(log.date) <= toDate);
    }

    if (limit) {
      logs = logs.slice(0, Number(limit));
    }

    const response = {
      username: user.username,
      _id: user._id,
      count: logs.length,
      log: logs.map((entry) => ({
        description: entry.description,
        duration: entry.duration,
        date: entry.date,
      })),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:_id/exercises", async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const exercise = await Exercise.createExercise(userId, {
      description,
      duration,
      date,
    });

    return res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
