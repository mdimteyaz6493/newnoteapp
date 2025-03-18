import express from "express";
import multer from "multer";
import Image from "../models/Image.js";
import jwt from "jsonwebtoken";
import fs from "fs";


const router = express.Router();

// ✅ Middleware: Token Verify
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied, No Token Provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// ✅ Multer Setup (Image Upload)
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Upload Image
router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const newImage = new Image({
      userId: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Get User Images
router.get("/", verifyToken, async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user.id });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete Image
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Delete file from uploads folder
    fs.unlinkSync(`.${image.imageUrl}`);

    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: "Image Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
