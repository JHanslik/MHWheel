const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Servir les fichiers statiques
app.use(express.static("./"));
// Servir tmi.js depuis node_modules
app.use(
  "/tmi.js",
  express.static(path.join(__dirname, "node_modules/tmi.js/dist/tmi.min.js"))
);

// Gérer toutes les routes en renvoyant index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
