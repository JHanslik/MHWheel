const CHANNEL_NAME = "bluepach";
const REWARD_ID = "9456d862-a83b-4f69-ab6d-75074ee02e98";

let wheel;
let ws;
let pubSubWs;

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

  // Chat WebSocket
  ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

  ws.onopen = () => {
    console.log("WebSocket Chat connecté");
    // Authentification
    ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
    ws.send(`PASS oauth:${accessToken}`);
    ws.send(`NICK ${CHANNEL_NAME}`);
    ws.send(`JOIN #${CHANNEL_NAME}`);
  };

  // PubSub WebSocket pour les récompenses
  pubSubWs = new WebSocket("wss://pubsub-edge.twitch.tv");

  pubSubWs.onopen = () => {
    console.log("WebSocket PubSub connecté");

    const listenMessage = {
      type: "LISTEN",
      nonce: "random_nonce",
      data: {
        topics: ["channel-points-channel-v1.59578916"],
        auth_token: accessToken,
      },
    };

    pubSubWs.send(JSON.stringify(listenMessage));

    setInterval(() => {
      pubSubWs.send(JSON.stringify({ type: "PING" }));
    }, 240000);
  };

  pubSubWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Message PubSub reçu:", data);

      if (data.type === "MESSAGE" && data.data) {
        const messageData = JSON.parse(data.data.message);

        if (
          messageData.data.redemption &&
          messageData.data.redemption.reward.id === REWARD_ID
        ) {
          console.log("Récompense Roue des armes activée !");
          const username = messageData.data.redemption.user.display_name;

          // Générer l'angle aléatoire une seule fois
          const spinAngle = 3600 + Math.random() * 360;

          // Faire tourner la roue principale
          wheel.spin(spinAngle);

          // Envoyer l'angle à l'overlay
          fetch("/spin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ angle: spinAngle }),
          }).catch(console.error);

          sendMessage(`@${username} lance la roue des armes !`);
        }
      }
    } catch (error) {
      console.error("Erreur parsing message PubSub:", error);
    }
  };

  // Gestion des messages du chat
  ws.onmessage = (event) => {
    if (event.data.includes("PRIVMSG")) {
      const message = event.data.split("PRIVMSG")[1].split(":")[1].trim();

      if (message.toLowerCase() === "!roue") {
        const usernameMatch = event.data.match(/display-name=([^;]+)/);
        const username = usernameMatch ? usernameMatch[1] : "utilisateur";

        console.log("Commande roue reçue de", username);

        // Même logique pour la commande !roue
        const spinAngle = 3600 + Math.random() * 360;
        wheel.spin(spinAngle);

        fetch("/spin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ angle: spinAngle }),
        }).catch(console.error);

        sendMessage(`@${username} lance la roue des armes !`);
      }
    }
  };

  ws.onclose = () => {
    console.log("WebSocket Chat déconnecté");
  };

  ws.onerror = (error) => {
    console.error("Erreur WebSocket Chat:", error);
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
