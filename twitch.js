const CHANNEL_NAME = "bluepach";
const REWARD_ID = "9456d862-a83b-4f69-ab6d-75074ee02e98";

let wheel;
let ws;
let pubSubWs;
let messageInProgress = false; // Pour éviter les doublons

document.addEventListener("DOMContentLoaded", () => {
  wheel = new WeaponWheel();
  wheel.draw();
  wheel.onSpinComplete = (selectedWeapon) => {
    if (!messageInProgress) {
      messageInProgress = true;
      // Message plus visible avec des emotes
      sendMessage(`⚔️ L'arme sélectionnée est : ${selectedWeapon} ! ⚔️`);
      setTimeout(() => {
        messageInProgress = false;
      }, 1000);
    }
  };
});

window.initTwitchChat = function (accessToken) {
  // Éviter les connexions multiples
  if (ws || pubSubWs) {
    console.log("Connexion déjà établie, ignorée");
    return;
  }

  console.log("Initialisation du chat Twitch...");

  // Chat WebSocket
  ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

  ws.onopen = () => {
    console.log("WebSocket Chat connecté");
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
        topics: [`channel-points-channel-v1.59578916`],
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

      if (data.type === "MESSAGE" && data.data) {
        const messageData = JSON.parse(data.data.message);

        if (
          messageData.data.redemption &&
          messageData.data.redemption.reward.id === REWARD_ID
        ) {
          console.log("Événement reçu:", {
            redemptionId: messageData.data.redemption.id,
            timestamp: new Date().toISOString(),
            user: messageData.data.redemption.user.display_name,
          });

          console.log("Récompense Roue des armes activée !");
          const username = messageData.data.redemption.user.display_name;

          if (!messageInProgress) {
            // Vérifier qu'un message n'est pas déjà en cours
            messageInProgress = true;
            sendMessage(`@${username} lance la roue des armes !`);
            wheel.spin();
            setTimeout(() => {
              messageInProgress = false;
            }, 1000); // Reset après 1 seconde
          }
        }
      }
    } catch (error) {
      console.error("Erreur parsing message PubSub:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket Chat déconnecté");
    ws = null;
  };

  ws.onerror = (error) => {
    console.error("Erreur WebSocket Chat:", error);
  };

  pubSubWs.onclose = () => {
    console.log("WebSocket PubSub déconnecté");
    pubSubWs = null;
  };

  pubSubWs.onerror = (error) => {
    console.error("Erreur WebSocket PubSub:", error);
  };
};

function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("Envoi du message:", message);
    ws.send(`PRIVMSG #${CHANNEL_NAME} :${message}`);
  } else {
    console.error("WebSocket non connecté ou non prêt");
  }
}
