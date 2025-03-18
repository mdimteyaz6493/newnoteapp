import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/images"; // Backend API URL

const ImageNote = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState(""); // Store JWT Token
  const [showColor, setShowColor] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showtype, setshowtype] = useState(false)
  const [noteType, setnoteType] = useState("textnote")
  const [sortOrder, setSortOrder] = useState("oldest"); // Sorting state

  // Fetch Images from Backend
  useEffect(() => {
    const userToken = localStorage.getItem("token"); // Fetch Token
    setToken(userToken);
    if (userToken) {
      axios
        .get(API_BASE, { headers: { Authorization: `Bearer ${userToken}` } })
        .then((res) => setNotes(res.data))
        .catch((err) => console.error("Error fetching images:", err));
    }
  }, []);
  const handleNoteType = (notetype)=>{
    if(notetype == "textnote"){
      navigate("/notes")
      setshowtype(false)
    }
    else{
      navigate("/image")
      setshowtype(false)
    }
    }
  // Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  // Save Image as Note
  const saveImageNote = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setNotes([...notes, res.data]);
      setImage(null);
    } catch (error) {
      console.error("Upload Error:", error);
    }
  };

  // Delete Image
  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // Download Image
  const downloadImage = (imgSrc) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000${imgSrc}`;
    link.download = "image-note.png";
    link.click();
  };

  return (
   <>
     <div className="notes-cont-head">
    <div className="menu">
      <>
      <div className="num_notes">Total Notes : {notes.length}</div>
      <div className="menu_cont">
        <span className="menu_title" onClick={() => setShowColor((prev) => !prev)}>Color</span>
        <ul className={showColor ? "menu_option show_menu" : "menu_option"}>
          {["yellow", "green", "orange", "pink", "purple", "paper"].map((color) => (
            <li key={color} onClick={() => handleColorChange(color)}>
              <div
                style={{
                  backgroundColor: color !== "paper" ? color : "white",
                  backgroundImage: color === "paper"
                    ? "repeating-linear-gradient(white, white 23px, #d3d3d3 25px)"
                    : "none",
                }}
              ></div>
              <span>{color}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="menu_cont">
      <span className="menu_title" onClick={() => setShowSort((prev) => !prev)}>Sort By</span>
        <ul className={showSort ? "menu_option show_menu" : "menu_option"}>
        <li
            className={sortOrder === "newest" ? "active" : ""}
            onClick={() => handleSort("newest")}
          >
            Newest
          </li>
          <li
            className={sortOrder === "oldest" ? "active" : ""}
            onClick={() => handleSort("oldest")}
          >
            Oldest
          </li>
        </ul>
      </div>
      <div className="menu_cont">
          <span className="menu_title" onClick={() => setshowtype((prev) => !prev)}>Note type</span>
            <ul className={showtype ? "menu_option show_menu" : "menu_option"}>
            <li
                className={sortOrder === "textnote" ? "active" : ""}
                onClick={() => handleNoteType("textnote")}
              >
                Text Note
              </li>
              <li
                className={sortOrder === "imagenote" ? "active" : ""}
                onClick={() => handleNoteType("imagenote")}
              >
                Image Note
              </li>
            </ul>
          </div>
      </>
    </div>
  </div>
    <div className="image-note-container">
      <h2>🖼 Image Notes</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      
      {image && (
        <div className="preview">
          <button onClick={saveImageNote}>Save Note</button>
        </div>
      )}

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note._id} className="note-card">
            <img src={`http://localhost:5000${note.imageUrl}`} alt="Note" className="note-img" />
            <div className="actions">
              <button onClick={() => downloadImage(note.imageUrl)}>📥 Download</button>
              <button onClick={() => deleteNote(note._id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
   </>
  );
};

export default ImageNote;
