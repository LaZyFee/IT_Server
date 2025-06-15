import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connected! Connection HOST: ${dbConnection.connection.host})`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default connectDB;