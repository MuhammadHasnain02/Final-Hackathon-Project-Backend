import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to Database
connectDB();

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Vercel Serverless Export Wrapper
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

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
