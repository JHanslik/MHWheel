require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const port = 3000;

// Créer le serveur HTTP
const server = http.createServer(app);

// Créer le serveur WebSocket attaché au serveur HTTP
const wss = new WebSocket.Server({ server });

// Servir les fichiers statiques
app.use(express.static("./"));

// Gérer les connexions WebSocket
wss.on("connection", function connection(ws) {
  console.log("Nouvelle connexion WebSocket");
});

// Route pour déclencher la rotation
app.post("/spin", (req, res) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send("spin");
    }
  });
  res.sendStatus(200);
});

// Route pour l'overlay
app.get("/overlay", (req, res) => {
  res.sendFile(path.join(__dirname, "wheel-overlay.html"));
});

// Gérer toutes les routes en renvoyant index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Écouter sur le port spécifié
server.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
