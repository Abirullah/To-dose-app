import mongoose from "mongoose";

let connectPromise = null;

const DbConnection = async () => {
  const uri = process.env.MONGOOSE_URL;
  if (!uri) {
    throw new Error("MONGOOSE_URL is not set");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        connectPromise = null;
        throw error;
      });
  }

  return connectPromise;
};
export default DbConnection;
