import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import path from "path";
import imageRoute from "./routes/imageRoute.js";


dotenv.config();
const app = express();
app.use("/uploads", express.static("uploads")); // Serve uploaded images
app.use(express.urlencoded({ extended: true })); // ✅ Parse URL-Encoded Form Data



const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Compass"))
  .catch((err) => console.log("MongoDB Connection Error:", err));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/images", imageRoute);


app.use(express.static(path.join(__dirname,"/frontend/dist")))
app.get('*',(_,res)=>{
  res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
