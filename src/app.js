const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const session = require("express-session");

const envConfig = require("./config/env.config");
const logger = require("./utils/logger");
const routes = require("./routes");
const { getDevLoginPage } = require("./helpers/logViewerLogin");
const { logViewer } = require("./helpers/logViewer");
const { notFoundHandler, errorHandler, errorConverter } = require("./middlewares/error.middleware");
const webhookRoutes = require("./modules/Booking/webhook.route");

// Initialize Express App
const app = express();

// Body Parsers with rawBody verification for Stripe webhooks
app.use(
  express.json({
    limit: "100mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// Security Headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Session
const MemoryStore = session.MemoryStore;
const memoryStore = new MemoryStore();

app.use(session({
  secret: envConfig.session.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: envConfig.env === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: envConfig.env === "production" ? "none" : "lax",
  },
  store: memoryStore,
}));

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

// API Access Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "Unknown";

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    logger.info({
      message: "API Hit",
      ip,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime
    });
  });

  next();
});

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static("public"));

// Serve assetlinks.json
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.json([{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.weego",
      "sha256_cert_fingerprints": [
        "E5:01:D5:F0:FD:A6:80:08:6C:1A:98:75:F3:9E:4F:30:98:05:7D:7C:D8:8B:1E:0E:DA:09:37:AE:32:1C:45:99"
      ]
    }
  }]);
});

// Webhook and API Routes
app.use(["/webhook", "/weebhook", "/helpers", "/stripe"], webhookRoutes);
app.use("/api/v1", routes);

// UI Pages (Instructor fallback)
app.get([
  "/instructor",
  "/instructor/*",
  "/notifications",
  "/notification"
], (req, res) => {
  res.sendFile(path.join(__dirname, "../public/instructor/index.html"));
});

// Admin UI Pages
app.get([
  "/admin",
  "/admin/overview",
  "/admin/dashboard",
  "/admin/verification",
  "/admin/verification/*",
  "/admin/verifications",
  "/admin/verifications/*",
  "/admin/disputes",
  "/admin/disputes/*",
  "/admin/profile",
  "/admin/profile/*",
  "/admin/settings",
  "/admin/settings/*"
], (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// Health check + Log Viewer
app.get("/", (req, res) => {
  res.send(getDevLoginPage());
});

app.post("/", (req, res) => {
  const { username, password } = req.body;
  if (username === envConfig.monitor.username && password === envConfig.monitor.password) {
    return logViewer(req, res);
  }
  res.status(401).send("Unauthorized");
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
