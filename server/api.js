const AesEncryption = require("aes-encryption");
const aes = new AesEncryption();
aes.setSecretKey(process.env.AES_SECRET);

const NodeRSA = require("node-rsa");

const initializeAPI = async (app, db) => {
  app.post("/api/login", login);

  app.get("/api/keys", (req, res) => {
    const key = new NodeRSA({ b: 1024 });
    const publicKey = key.exportKey("public");
    const privateKey = key.exportKey("private");
    res.json({ publicKey, privateKey });
  });

  app.post("/api/posts", (req, res) => {
    const { title, content } = req.body;
    const encryptedTitle = aes.encrypt(title);
    const encryptedContent = aes.encrypt(content);
    db.run(
      "INSERT INTO posts (title, content) VALUES (?, ?)",
      [encryptedTitle, encryptedContent],
      function (err) {
        if (err) {
          res.status(500).send("Error al crear el post");
        } else {
          res.status(201).send({ id: this.lastID });
        }
      }
    );
  });

  app.get("/api/posts", (req, res) => {
    db.all("SELECT * FROM posts", [], (err, rows) => {
      if (err) {
        res.status(500).send("Error al obtener los posts");
      } else {
        const decryptedRows = rows.map((row) => ({
          id: row.id,
          title: aes.decrypt(row.title),
          content: aes.decrypt(row.content),
        }));
        res.json(decryptedRows);
      }
    });
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const answer = `
    <h1>Answer</h1>
    <p>Username: ${username}</p>
    <p>Password: ${password}</p>
  `;

  res.send(answer);
};

module.exports = { initializeAPI };
