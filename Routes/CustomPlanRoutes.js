import express from "express";
import {
    createCustomPlan,
    getAllCustomPlans,
    updateCustomPlanStatus,
    getUserCustomPlans
} from "../Controllers/CustomPlanController.js";

const router = express.Router();

// POST - Create custom plan
router.post("/:id", createCustomPlan);

// GET - Admin fetches all custom plan requests
router.get("/", getAllCustomPlans);

// PATCH - Admin updates status of a custom plan (approve/reject)
router.patch("/:id/status", updateCustomPlanStatus);

// GET - User fetches their custom plans
router.get("/:id", getUserCustomPlans);


export default router;
