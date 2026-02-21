import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");

const STORAGE_PROVIDER =
  (process.env.STORAGE_PROVIDER || "local").trim().toLowerCase() || "local";

const toPublicBaseUrl = () => {
  const explicit = (process.env.PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const port = Number(process.env.PORT) || 5000;
  return `http://localhost:${port}`;
};

const sanitizeFolder = (folder = "") =>
  String(folder)
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");

const getExtension = ({ originalName, filePath, resourceType }) => {
  const explicitExt =
    path.extname(originalName || "").toLowerCase() ||
    path.extname(filePath || "").toLowerCase();
  if (explicitExt) return explicitExt;
  if (resourceType === "image") return ".png";
  if (resourceType === "raw") return ".pdf";
  return ".bin";
};

const removeTempFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // ignore cleanup errors
  }
};

const uploadToLocalStorage = async (
  filePath,
  { folder = "ToDosApp", resource_type = "auto", originalName = "" } = {}
) => {
  const safeFolder = sanitizeFolder(folder) || "ToDosApp";
  const ext = getExtension({
    originalName,
    filePath,
    resourceType: resource_type,
  });

  const targetDir = path.join(uploadsRoot, ...safeFolder.split("/"));
  await fs.promises.mkdir(targetDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const targetPath = path.join(targetDir, fileName);
  await fs.promises.rename(filePath, targetPath);

  const relativeUrlPath = path.posix.join(
    "uploads",
    ...safeFolder.split("/"),
    fileName
  );
  return `${toPublicBaseUrl()}/${relativeUrlPath}`;
};

const uploadToCloudinaryProvider = async (
  filePath,
  { folder = "ToDosApp", resource_type = "auto" } = {}
) => {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is selected but CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are missing."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type,
  });

  await removeTempFile(filePath);
  return result.secure_url;
};

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    if (STORAGE_PROVIDER === "cloudinary") {
      return await uploadToCloudinaryProvider(filePath, options);
    }
    return await uploadToLocalStorage(filePath, options);
  } catch (error) {
    await removeTempFile(filePath);
    throw error;
  }
};

export default uploadToCloudinary;
