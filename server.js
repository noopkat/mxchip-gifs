require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
let client, registry;

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/api/devices/list", function(req, res) {
  if (!registry) return res.send([]);
});

app.post("/api/gif", function(req, res) {
  if (!client) return res.sendStatus(500);
});

server.listen(port);

