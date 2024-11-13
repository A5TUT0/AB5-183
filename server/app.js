const express = require("express");
const http = require("http");
const { initializeAPI } = require("./api");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

// Create the express server
const app = express();
app.use(express.json());
const server = http.createServer(app);
db.serialize(() => {
  db.run(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  )`);
});
// deliver static files from the client folder like css, js, images
app.use(express.static("client"));
// route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

// Initialize the REST api
initializeAPI(app, db);

//start the web server
const serverPort = 3000;
server.listen(serverPort, () => {
  console.log(`Express Server started on port ${serverPort}`);
});
