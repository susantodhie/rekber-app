import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import "dotenv/config";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB

// Ensure upload directories exist
const dirs = ["kyc", "shipping", "chat", "avatars"];
for (const dir of dirs) {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Determine subdirectory based on route
    const routePath = req.baseUrl + req.path;
    let subDir = "general";

    if (routePath.includes("/kyc")) subDir = "kyc";
    else if (routePath.includes("/escrow")) subDir = "shipping";
    else if (routePath.includes("/message") || routePath.includes("/conversation")) subDir = "chat";
    else if (routePath.includes("/user") || routePath.includes("/profile")) subDir = "avatars";

    cb(null, path.join(uploadDir, subDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter — images only for KYC, images + docs for chat
const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WebP, HEIC) are allowed"));
  }
};

const generalFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp", "image/heic",
    "application/pdf",
    "video/mp4", "video/quicktime",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"));
  }
};

// Export pre-configured upload instances
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: maxFileSize },
});

export const uploadFile = multer({
  storage,
  fileFilter: generalFilter,
  limits: { fileSize: maxFileSize },
});
