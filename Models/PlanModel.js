import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        features: {
            type: [String],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export const Plan = mongoose.model("Plan", planSchema);