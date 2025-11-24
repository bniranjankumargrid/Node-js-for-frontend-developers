
let db;

async function getDb() {
  if (!db) {
    const sqlite = await import("sqlite-async");
    db = new sqlite.Database();
    await db.open("./mydb.sqlite");     
    await db.run(`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL
      );
    `);
    await db.run(`
          CREATE TABLE IF NOT EXISTS Exercise (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          description TEXT NOT NULL,
          duration INTEGER NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY(userId) REFERENCES User(id)
          );
        `);

  }
  return db;
}

module.exports = { getDb };
