import uploadToCloudinary from "../Utils/Cloudnary.js";

const CloudinaryMiddlewear = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.json({ message: "No file uploaded" });
    }

    req.fileUrl = await uploadToCloudinary(req.file.path, {
      folder: "ToDosApp/middleware-uploads",
      resource_type: "auto",
      originalName: req.file.originalname,
    });
    next();
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

export default CloudinaryMiddlewear;

