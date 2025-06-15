import express from "express";
import {
    createHireRequest,
    getAllHireRequests,
    updateHireRequestStatus,
    getUserHireRequests,
} from "../Controllers/HireRequestController.js";

const router = express.Router();

// POST - Create hire request (with user ID)
router.post("/create", createHireRequest);

// GET - Admin fetches all requests
router.get("/", getAllHireRequests);

// PATCH - Admin updates status of a request
router.patch("/:id/status", updateHireRequestStatus);

// GET - User fetches their requests
router.get("/user/:id", getUserHireRequests);

export default router;
