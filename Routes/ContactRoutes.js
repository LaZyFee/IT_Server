import express from "express";
import { submitContactForm, markAsResponded, getAllMessages } from "../Controllers/ContactController.js";

const router = express.Router();

router.post("/contact", submitContactForm);
router.patch("/messages/:id/responded", markAsResponded);
router.get("/messages", getAllMessages);

export default router;
