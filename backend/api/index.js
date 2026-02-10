import app from "../app.js";

export default function handler(req, res) {
  const url = req.url || "/";
  if (url.startsWith("/api")) {
    req.url = url.replace(/^\/api/, "") || "/";
  }
  return app(req, res);
}

