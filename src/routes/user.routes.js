const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const validator = require('validator');
const Exercise = require("../models/exercise.model");

router.get("/:_id/logs", async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const logs = await Exercise.findByUserId({
      userId: _id,
      from,
      to,
      limit
    });

    res.json({
      username: user.username,
      _id: user._id,
      count: logs.count,
      log: logs.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:_id/exercises", async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;
    
    if(!description){
      return res.status(400).json({ error: "description is required" })
    }
    if(!duration){
      return res.status(400).json({ error: "duration is required" })
    }
    if (!Number.isInteger(Number(duration))) {
      return res.status(400).json({ error: "duration must be an integer" });
    }

    if (Number(duration) <= 0) {
      return res.status(400).json({ error: "duration must be a positive integer" });
    }

    if(date){
      if(!validator.isDate(date,{format:"YYYY-MM-DD",delimiters:['-']})){
        return res.status(400).json({ error: "invalid date format" });
      }
    }
    
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
      date: new Date(exercise.date).toDateString(),
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
