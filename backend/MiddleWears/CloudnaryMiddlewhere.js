import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const CloudinaryMiddlewear = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.json({ message: "No file uploaded" });
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "TodoApp",
        });
        req.fileUrl = result.secure_url;
        next();
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ message: "Cloudinary upload failed", error });
    }
};

export default CloudinaryMiddlewear;


