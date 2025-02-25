const CHANNEL_NAME = "bluepach";
const POINTS_COST = 1000;
const CLIENT_ID = "gkabbyd9027f5oxp8uboijlsuucfqj";

let wheel;
let ws;

// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", () => {
  // Initialiser la roue
  wheel = new WeaponWheel();
  wheel.draw();

  // Définir le callback immédiatement après la création de la roue
  wheel.onSpinComplete = (selectedWeapon) => {
    console.log("Callback onSpinComplete appelé avec:", selectedWeapon);
    sendMessage(`L'arme sélectionnée est : ${selectedWeapon} !`);
  };
});

// Fonction d'initialisation exposée globalement
window.initTwitchChat = function (accessToken) {
  console.log("Initialisation du chat Twitch...");

  // Connexion WebSocket
  ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

  ws.onopen = () => {
    console.log("WebSocket connecté");
    // Authentification
    ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
    ws.send(`PASS oauth:${accessToken}`);
    ws.send(`NICK ${CHANNEL_NAME}`);
    ws.send(`JOIN #${CHANNEL_NAME}`);
  };

  ws.onmessage = (event) => {
    console.log("Message reçu:", event.data);

    // Répondre au PING pour maintenir la connexion
    if (event.data.startsWith("PING")) {
      ws.send("PONG");
      return;
    }

    // Parser les messages du chat
    if (event.data.includes("PRIVMSG")) {
      const match = event.data.match(/:([^!]+).*PRIVMSG[^:]+:(.+)/);
      if (match) {
        const [, username, message] = match;

        if (message.toLowerCase() === "!roue") {
          console.log("Commande roue reçue de", username);
          wheel.spin();
          sendMessage(`@${username} lance la roue des armes !`);
        }
      }
    }
  };

  ws.onclose = () => {
    console.log("WebSocket déconnecté");
  };

  ws.onerror = (error) => {
    console.error("Erreur WebSocket:", error);
  };
};

// Fonction pour envoyer un message dans le chat
function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("Envoi du message:", message);
    ws.send(`PRIVMSG #${CHANNEL_NAME} :${message}`);
  } else {
    console.error("WebSocket non connecté ou non prêt");
  }
}

// Écouter l'événement de fin de rotation
wheel.onSpinComplete = (selectedWeapon) => {
  console.log("Callback onSpinComplete appelé avec:", selectedWeapon);
  sendMessage(`L'arme sélectionnée est : ${selectedWeapon} !`);
};

// Vérification des points de chaîne
async function checkChannelPoints(username) {
  try {
    const response = await fetch(
      "https://api.twitch.tv/helix/channel_points/custom_rewards",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": CLIENT_ID,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur API Twitch");
    }

    const data = await response.json();
    console.log("Points data:", data);

    // Pour le moment, on retourne true pour tester
    return true;
  } catch (error) {
    console.error("Erreur vérification points:", error);
    return false;
  }
}
