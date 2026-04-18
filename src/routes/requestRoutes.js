import express from "express";
import { createRequest, getRequests, getRequestById, updateRequestStatus } from "../controllers/requestController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, createRequest);
router.get("/", auth, getRequests);
router.get("/:id", auth, getRequestById);
router.patch("/:id/status", auth, updateRequestStatus);

export default router;
