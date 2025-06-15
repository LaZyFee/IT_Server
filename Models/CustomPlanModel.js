import mongoose from "mongoose";

const customPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        service: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        proposedPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        paymentStatus:{
            type: String,
            default: "pending"
        }
    },
    { timestamps: true }
);

export const CustomPlan = mongoose.model("CustomPlan", customPlanSchema);
