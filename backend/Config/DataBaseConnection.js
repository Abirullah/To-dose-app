import mongoose from "mongoose";

let connectPromise = null;

const DbConnection = async () => {
  const uri =
    (process.env.MONGOOSE_URL || "").trim() ||
    "mongodb://127.0.0.1:27017/todose_local";

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
