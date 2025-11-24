const { getDb } = require("../db/database");

class User {
  constructor({ id, username }) {
    this._id = id?.toString();
    this.username = username;
  }

  static async create({ username }) {
    const db = await getDb();

    if (!username || username.trim() === "") {
      throw new Error("Username is required");
    }
    
    const existing = await db.get("SELECT * FROM User WHERE username = ?", [username]);
    if (existing) {
      throw new Error("Username already exists");
    }

    const result = await db.run(
      "INSERT INTO User (username) VALUES (?)",
      [username]
    );

    return new User({
      id: result.lastID, 
      username
    });
  }
  static async findById(id) {
    const db = await getDb();
    const row = await db.get("SELECT * FROM User WHERE id = ?", [id]);
    if (!row) return null;
    return new User(row);
  }
  
  static async findAll() {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM User");

    return rows.map(row => new User(row));
  }
}

module.exports = User;
