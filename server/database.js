const sqlite3 = require("sqlite3").verbose();

const tweetsTableExists =
  "SELECT name FROM sqlite_master WHERE type='table' AND name='tweets'";
const createTweetsTable = `CREATE TABLE tweets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  timestamp TEXT,
  text TEXT
)`;

const usersTableExists =
  "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
const createUsersTable = `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)`;
const seedUsersTable = `INSERT INTO users (username, password) VALUES
  ('switzerchees', '123456'),
  ('john', '123456'),
  ('jane', '123456')
`;

const postsTableExists =
  "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'";
const createPostsTable = `CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL
)`;

const initializeDatabase = async () => {
  const db = new sqlite3.Database("./minitwitter.db");

  db.serialize(() => {
    db.get(tweetsTableExists, [], async (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        await db.run(createTweetsTable);
      }
    });
    db.get(usersTableExists, [], async (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        db.run(createUsersTable, [], async (err) => {
          if (err) return console.error(err.message);
          db.run(seedUsersTable);
        });
      }
    });
    db.get(postsTableExists, [], async (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        await db.run(createPostsTable);
      }
    });
  });

  return db;
};

const insertDB = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
};

const queryDB = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = { initializeDatabase, queryDB, insertDB };
