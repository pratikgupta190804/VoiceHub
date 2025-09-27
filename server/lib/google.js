const { Google } = require("arctic");

const redirectURI =
  process.env.NODE_ENV === "production"
    ? "https://chit-chat-realtime-chat-app-2.onrender.com/api/auth/google/callback"
    : "http://localhost:5001/api/auth/google/callback";

exports.google = new Google(
  process.env.Client_ID,
  process.env.Client_secret,
  redirectURI
);
