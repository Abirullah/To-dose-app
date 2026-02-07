import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadToCloudinary = async (
  filePath,
  { folder = "ToDosApp", resource_type = "auto" } = {}
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type,
    });

    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore
    }
    throw error;
  }
};

export default uploadToCloudinary;
