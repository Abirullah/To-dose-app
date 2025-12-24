import mongoose from "mongoose";

const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL);
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection error:", error.massage);
    }
}
export default DbConnection;