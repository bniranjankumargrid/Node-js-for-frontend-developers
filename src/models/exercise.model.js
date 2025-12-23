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
  
    const countSql = `SELECT COUNT(*) AS total ${sql}`;
    const countResult = await db.get(countSql, params);
    const totalCount = countResult.total;
  
    let dataSql = `SELECT description, duration, date ${sql} ORDER BY date ASC`;
    if (!isNaN(limit) && Number(limit) > 0) {
      dataSql += " LIMIT ?";
      params.push(Number(limit));
    }
  
    let rows = await db.all(dataSql, params);
  
    rows = rows.map(data => ({
      ...data,
      date: new Date(data.date).toDateString()
    }));
  
    return {
      data: rows,
      count: totalCount
    };
  }
  
}

module.exports = Exercise;
