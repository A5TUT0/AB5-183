const { initializeDatabase, queryDB, insertDB } = require("./database");
const AesEncryption = require("aes-encryption");
const NodeRSA = require("node-rsa");
require("dotenv").config();

const aes = new AesEncryption();
aes.setSecretKey(process.env.AES_SECRET);

let db;

const initializeAPI = async (app) => {
  db = await initializeDatabase();
  app.get("/api/feed", getFeed);
  app.post("/api/feed", postTweet);
  app.post("/api/login", login);
  app.get("/api/posts", getPosts);
  app.post("/api/posts", createPost);
  app.get("/api/keys", generateKeys);
};

const getFeed = async (req, res) => {
  const query = req.query.q;
  const tweets = await queryDB(db, query);
  res.json(tweets);
};

const postTweet = async (req, res) => {
  await insertDB(db, req.body.query);
  res.json({ status: "ok" });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  const user = await queryDB(db, query, [username, password]);
  if (user.length === 1) {
    res.json(user[0]);
  } else {
    res.json(null);
  }
};

const getPosts = async (req, res) => {
  const posts = await queryDB(db, "SELECT * FROM posts");
  const decryptedPosts = posts.map((post) => ({
    id: post.id,
    title: aes.decrypt(post.title),
    content: aes.decrypt(post.content),
  }));
  res.json(decryptedPosts);
};

const createPost = async (req, res) => {
  const { title, content } = req.body;
  const encryptedTitle = aes.encrypt(title);
  const encryptedContent = aes.encrypt(content);
  const query = `INSERT INTO posts (title, content) VALUES (?, ?)`;
  await insertDB(db, query, [encryptedTitle, encryptedContent]);
  res.json({ status: "ok" });
};

const generateKeys = (req, res) => {
  const key = new NodeRSA({ b: 1024 });
  const publicKey = key.exportKey("public");
  const privateKey = key.exportKey("private");
  res.json({ publicKey, privateKey });
};

module.exports = { initializeAPI };
