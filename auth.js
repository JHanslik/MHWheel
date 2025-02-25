const clientId = "gkabbyd9027f5oxp8uboijlsuucfqj";
const redirectUri = "http://localhost:3000";
const scopes = [
  "chat:read",
  "chat:edit",
  "channel:read:redemptions",
  "channel:manage:redemptions",
].join(" ");

// Vérifier le token au chargement
window.addEventListener("load", () => {
  handleRedirect();
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

function handleRedirect() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    if (accessToken) {
      console.log("Token trouvé");
      localStorage.setItem("twitchAccessToken", accessToken);
      document.getElementById("loginButton").style.display = "none";
      document.querySelector(".wheel-container").style.display = "block";
      initializeTwitchClient(accessToken);
      // Nettoyer l'URL
      history.pushState("", document.title, window.location.pathname);
    }
  } else {
    const token = localStorage.getItem("twitchAccessToken");
    if (token) {
      console.log("Token trouvé dans le localStorage");
      document.getElementById("loginButton").style.display = "none";
      document.querySelector(".wheel-container").style.display = "block";
      initializeTwitchClient(token);
    } else {
      console.log("Pas de token");
      document.getElementById("loginButton").style.display = "block";
      document.querySelector(".wheel-container").style.display = "none";
    }
  }
}

function initializeTwitchClient(token) {
  if (window.initTwitchChat) {
    window.initTwitchChat(token);
  }
}
