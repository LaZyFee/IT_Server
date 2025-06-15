import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        plan: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Plan",
            },
        ],
    },

    { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);
