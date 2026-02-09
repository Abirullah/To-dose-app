import mongoose from "mongoose";

const DbConnection = async () => {
  const uri = process.env.MONGOOSE_URL;
  if (!uri) {
    throw new Error("MONGOOSE_URL is not set");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });

  return mongoose.connection;
};
export default DbConnection;
