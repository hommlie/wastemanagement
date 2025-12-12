require("dotenv").config();
require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log("Incoming request origin:", req.headers.origin);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

const adminRoutes = require("./routes/admin.routes");
app.use("/api/admin", adminRoutes);

app.use((req, res, next) => {
  if (req.path && req.path.startsWith("/api/admin")) {
    return res.status(404).json({ status: 0, message: "API route not found" });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err && err.message ? err.message : err);
  if (err && err.message && err.message.includes("CORS")) {
    return res.status(403).json({ status: 0, message: err.message });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ status: 0, message: "Image too large" });
  }
  return res.status(500).json({ status: 0, message: err && err.message ? err.message : "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
