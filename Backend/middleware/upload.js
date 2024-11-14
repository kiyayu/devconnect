// multerConfig.js or profileUpload.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dfmujwmjp",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_files", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "jpg","png", "gif" ,"pdf", "mp4", "mp3" , "wav", "doc", "docx" ],   
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional: resize images
    public_id: (req, file) => {
      const fileName = file.originalname.split(".")[0];
      return `files_${Date.now()}_${fileName}`;
    },
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: 5MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
});

module.exports = upload;
