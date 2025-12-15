const { getDb } = require("../db/database");
const User = require("../models/user.model");
class Exercise {
  constructor({ id, username, description, duration, date }) {
    this._id = id;
    this.username = username;
    this.description = description;
    this.duration = duration;
    this.date = date;
  }

  static async createExercise(userId,{description, duration, date }) {
    const db = await getDb();
    const user = await User.findById(userId);
    if (!description || !duration) {
      throw { status: 400, message: "description and duration are required" };
    }

    const curDate = date ? new Date(date) : new Date();

    if (curDate.toString() === "Invalid Date") {
      throw { status: 400, message: "Invalid date format" };
    }

    const formattedDate = curDate.toISOString().split("T")[0];

    const result = await db.run(
      `INSERT INTO Exercise (userId, description, duration, date)
       VALUES (?, ?, ?, ?)`,
      [userId, description, duration, formattedDate]
    );

    return new Exercise({
      _id: user._id,
      username: user.username,
      description,
      duration: Number(duration),
      date: formattedDate
    });
  }

  static async findByUserId({ userId, from, to, limit }) {
    const db = await getDb();
  
    let sql = `
      SELECT description, duration, date
      FROM Exercise
      WHERE userId = ?
    `;
    const params = [userId];
  
    if (from) {
      sql += " AND date >= ?";
      params.push(from);
    }
  
    if (to) {
      sql += " AND date <= ?";
      params.push(to);
    }
  
    sql += " ORDER BY date ASC";
  
    if (!isNaN(limit) && Number(limit) > 0) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
  
    const rows = await db.all(sql, params);
    return rows;
  }
}

module.exports = Exercise;
