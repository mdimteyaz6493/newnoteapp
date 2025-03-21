import express from "express";
import Note from "../models/Note.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ Middleware to verify token
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

// ✅ Create Note
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newNote = new Note({
      userId: req.user.id,
      title,
      content,
      isFavorite: false, // Default favorite false
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

// ✅ Toggle Favorite Note (Fixed Route Order: Placed Before `/id`)
router.put("/favorite/:id", verifyToken, async (req, res) => {
  try {
    console.log("Received request to toggle favorite for:", req.params.id);
    console.log("User ID from token:", req.user.id);

    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      console.log("Note not found for this user!");
      return res.status(404).json({ message: "Note not found" });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json({ success: true, isFavorite: note.isFavorite });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ✅ Get User's Favorite Notes
router.get("/favorites", verifyToken, async (req, res) => {
  try {
    const favorites = await Note.find({ userId: req.user.id, isFavorite: true });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update Note
router.put("/:id", verifyToken, async (req, res) => {
  try {
    console.log("Updating note:", req.params.id); // Debugging

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete Note
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    console.log("Deleting note:", req.params.id); // Debugging

    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json({ message: "Note Deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
