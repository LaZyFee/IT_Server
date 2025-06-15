import mongoose from "mongoose";

const hireRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        service: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
    },
    { timestamps: true }
);

export const HireRequest = mongoose.model("HireRequest", hireRequestSchema);
