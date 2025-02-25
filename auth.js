const clientId = "gkabbyd9027f5oxp8uboijlsuucfqj";
const redirectUri = "https://6e55-88-178-41-17.ngrok-free.app";
const scopes = [
  "chat:read",
  "chat:edit",
  "channel:read:redemptions",
  "channel:manage:redemptions",
].join(" ");

// Vérifier le token au chargement
window.addEventListener("load", () => {
  const token = getAccessToken();
  if (token) {
    console.log("Token trouvé");
    document.getElementById("loginButton").style.display = "none";
    document.querySelector(".wheel-container").style.display = "block";
    initializeTwitchClient(token);
  } else {
    console.log("Pas de token");
    document.getElementById("loginButton").style.display = "block";
    document.querySelector(".wheel-container").style.display = "none";
  }
});

function login() {
  const authUrl =
    `https://id.twitch.tv/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(scopes)}`;

  console.log("URL de connexion:", authUrl);
  window.location.href = authUrl;
}

// Récupérer le token depuis l'URL après redirection
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

// Fonction pour initialiser le client Twitch
function initializeTwitchClient(token) {
  if (window.initTwitchChat) {
    window.initTwitchChat(token);
  }
}
