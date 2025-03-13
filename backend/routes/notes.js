import express from "express";
import Note from "../models/Note.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // 👈 "Bearer token" ka correct handling
  
    console.log("Received Token:", token); // 🔹 Debugging ke liye
  
    if (!token) return res.status(401).json({ message: "Access Denied, No Token Provided" });
  
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Verified User:", verified); // 🔹 Debugging ke liye
      req.user = verified;
      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(400).json({ message: "Invalid Token" });
    }
  };
  

// ✅ Create Note (Fixed)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    // ✅ Input Validation
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newNote = new Note({
      userId: req.user.id,
      title,
      content,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Get User Notes
router.get("/", verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).lean();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update Note
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete Note
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json({ message: "Note Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
