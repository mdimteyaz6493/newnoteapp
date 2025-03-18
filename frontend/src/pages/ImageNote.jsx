import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://newnoteapp-3.onrender.com/api/images";

const ImageNote = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    setToken(userToken);
    if (userToken) {
      axios
        .get(API_BASE, { headers: { Authorization: `Bearer ${userToken}` } })
        .then((res) => setNotes(res.data))
        .catch((err) => console.error("Error fetching images:", err));
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const saveImageNote = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setNotes([...notes, res.data]);
      setImage(null);
    } catch (error) {
      console.error("Upload Error:", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const downloadImage = (imgSrc) => {
    const link = document.createElement("a");
    link.href = `https://newnoteapp-3.onrender.com${imgSrc}`;
    link.download = "image-note.png";
    link.click();
  };

  const openModal = (note) => {
    setSelectedNote(note);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNote(null);
  };

  return (
    <>
      <div className="image-note-container">
        <h2>Image Notes</h2>
        {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}
        <div class="container">
          <label className="custom-file-upload">
            <input className="title" type="file" onChange={handleImageUpload} accept="image/*"/>
            Choose a file
          </label>
        </div>
        {image && (
          <div className="preview">
            <button onClick={saveImageNote}>Save Note</button>
          </div>
        )}
        <div className="notes-grid">
          {notes.map((note) => (
            <div className="note_card_back">
            <div key={note._id} className="note-card">
              <img
                src={
                  note.imageUrl.startsWith("http")
                    ? note.imageUrl
                    : `https://newnoteapp-3.onrender.com${note.imageUrl}`
                }
                alt="Note"
                className="note-img"
                onClick={() => openModal(note)}
              />
            </div>
            </div>
          ))}
        </div>
        {/* Modal for Image */}
        {showModal && selectedNote && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-btn" onClick={closeModal}>
                ×
              </span>
              <img
                src={
                  selectedNote.imageUrl.startsWith("http")
                    ? selectedNote.imageUrl
                    : `https://newnoteapp-3.onrender.com${selectedNote.imageUrl}`
                }
                alt="Note"
                className="modal-img"
              />
              <h3>{selectedNote.title}</h3>
              <p>{selectedNote.description}</p>
              <div className="modal-actions">
                <button onClick={() => downloadImage(selectedNote.imageUrl)}>
                  📥 Download
                </button>
                <button onClick={() => deleteNote(selectedNote._id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            position: relative;
          }
          .modal-img {
            max-width: 90%;
            max-height: 400px;
          }
          .modal-actions {
            margin-top: 10px;
          }
          .modal-actions button {
            margin: 5px;
          }
          .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 20px;
            cursor: pointer;
          }
        `}
      </style>
    </>
  );
};

export default ImageNote;
