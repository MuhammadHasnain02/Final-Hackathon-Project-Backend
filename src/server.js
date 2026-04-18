import "dotenv/config";
import express from "express";
import dns from "dns";

// Fix for MongoDB Atlas ECONNREFUSED SRV issues in some environments
if (dns.setServers) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Check required environment variables
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.warn(`WARNING: Missing required environment variable: ${env}`);
  }
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes are initialized after middleware
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is healthy 🚀" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Connect to Database and then start server
const startApp = async () => {
  try {
    await connectDB();
    
    // Vercel Serverless Export Wrapper
    if (process.env.NODE_ENV !== "production") {
      const startServer = (port) => {
        const server = app.listen(port, () => {
          console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
        });

        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            const nextPort = parseInt(port) + 1;
            console.log(`⚠️ Port ${port} is already in use. Trying port ${nextPort}...`);
            startServer(nextPort);
          } else {
            console.error('❌ Server error:', err);
          }
        });
      };

      startServer(Number(PORT));
    }
  } catch (err) {
    console.error("❌ Failed to start application:", err);
  }
};

startApp();

export default app;

// =======================================================

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

// // Routes
// import { connectDB } from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import subscriptionRoutes from "./routes/subscriptionRoutes.js";
// import webhookRoutes from "./routes/webhookRoutes.js";

// dotenv.config();

// // Connect to Database
// connectDB();

// const app = express();

// // Global Middleware
// const corsOrigin = process.env.CLIENT_URL || "http://localhost:5173";
// app.use(
//   cors({
//     origin: corsOrigin,
//     credentials: true,
//   })
// );

// // ===========================
// // STRIPE WEBHOOK CONFIG
// // ===========================
// // Webhook route MUST come BEFORE express.json() because Stripe needs the raw body
// app.use(
//   "/api/webhook", 
//   express.raw({ type: "application/json" }), 
//   webhookRoutes
// );

// // Standard JSON Parser for the rest of the application
// app.use(express.json());

// // Main App Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/subscription", subscriptionRoutes);

// // Health Check Endpoint
// app.get("/", (req, res) => {
//   res.status(200).send("SaaS API is Running 🚀");
// });

// // Vercel Serverless Export Wrapper
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
//   });
// }

// // Export for Vercel `api/index.js`
// export default app;
