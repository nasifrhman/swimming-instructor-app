const app = require("./app");
const envConfig = require("./config/env.config");
const logger = require("./utils/logger");
const { connectDatabase, disconnectDatabase } = require("./infrastructure/database/mongoose");
const cacheService = require("./infrastructure/cache/cache.service");
const { seedAdmin } = require("./seeder/seed");
const { initCronJobs } = require("./jobs/bookingSync.cron");

// Socket.io setup
const { createServer } = require("http");
const { socketIO } = require("./socket/socketIO.js");
const socket = require("socket.io");

const socketServer = createServer();
const io = socket(socketServer, {
  cors: {
    origin: "*",
  },
  reconnection: true,
  reconnectionAttempts: 2,
  reconnectionDelay: 1000,
});

global.io = io;

let server = null;
let secondaryServer = null;
const port = envConfig.port;
const altPort = envConfig.secondaryPort;
const serverIP = envConfig.serverIP;
const appName = envConfig.appName;

async function startServer() {
  try {
    await connectDatabase();
    await seedAdmin();
    initCronJobs();

    server = app.listen(port, () => {
      console.dir(`---> ${appName} server is running at: http://${serverIP}:${port}`);
    });

    if (altPort && altPort !== port) {
      try {
        secondaryServer = app.listen(altPort, () => {
          console.dir(`---> 🌐 ${appName} secondary port listener running at: http://${serverIP}:${altPort}`);
        });
      } catch (altErr) {
        // Continue cleanly if alt port is occupied
      }
    }

    try {
      if (server) io.attach(server);
      if (secondaryServer) io.attach(secondaryServer);
    } catch (attachErr) {
      console.warn("Socket.io attach to express server warning:", attachErr.message);
    }

    socketServer.listen(envConfig.socketPort, () => {
      console.dir(`---> 🌐 ${appName} Socket server is listening on: http://${serverIP}:${envConfig.socketPort}`);
    });

    socketIO(io);

  } catch (error) {
    console.error("💀 Server start error:", error);
    logger.error({
      message: error.message,
      status: error.status || 500,
      method: "server-start",
      url: "server-start",
      stack: error.stack,
    });
    process.exit(1);
  }
}

startServer();

async function graceful(err) {
  console.error("Received shutdown signal or error:", err);
  logger.error({
    message: err ? err.message : 'Shutdown',
    status: err?.status || 500,
    method: "graceful",
    url: "server.js -> graceful",
    stack: err?.stack,
  });

  try {
    await disconnectDatabase();
    await cacheService.disconnect();
  } catch (dbErr) {
    // Continue exit
  }

  if (server) {
    server.close(() => {
      console.log("Server closed. Exiting process.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);
process.on("uncaughtException", graceful);
