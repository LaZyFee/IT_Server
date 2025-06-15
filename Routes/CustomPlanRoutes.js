import express from "express";
import {
    createCustomPlan,
    getAllCustomPlans,
    updateCustomPlanStatus,
    getUserCustomPlans
} from "../Controllers/CustomPlanController.js";

const router = express.Router();

// 1️⃣ Get all custom plans (admin)
router.get("/", getAllCustomPlans);

// 2️⃣ Update custom plan status (admin)
router.patch("/:id/status", updateCustomPlanStatus);

// 3️⃣ Get custom plans by user
router.get("/user/:id", getUserCustomPlans);

// 4️⃣ Create custom plan
router.post("/:id", createCustomPlan);

export default router;
