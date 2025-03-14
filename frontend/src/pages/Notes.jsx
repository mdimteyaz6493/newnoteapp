import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/notes.css";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOpenInNew } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { MdDelete } from "react-icons/md";
import { MdEditNote } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    id: null,
    title: "",
    content: "",
  });

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("https://newnoteapp-3.onrender.com/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, [token, navigate]);

  // Open Add Note Modal
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentNote({ id: null, title: "", content: "" });
    setModalOpen(true);
  };

  // Open Edit Note Modal
  const openEditModal = () => {
    setIsEditing(true);
    setModalOpen(true);
    setViewModalOpen(false);
  };

  // Open View Note Modal
  const openViewModal = (note) => {
    setCurrentNote({ id: note._id, title: note.title, content: note.content });
    setViewModalOpen(true);
  };

  // Handle Save (for both Add & Edit)
  const handleSave = async () => {
    if (!currentNote.title.trim() || !currentNote.content.trim()) {
      alert("Title and content are required!");
      return;
    }

    try {
      if (isEditing) {
        // Update Note
        await axios.put(
          `https://newnoteapp-3.onrender.com/api/notes/${currentNote.id}`,
          { title: currentNote.title, content: currentNote.content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes(
          notes.map((note) =>
            note._id === currentNote.id
              ? {
                  ...note,
                  title: currentNote.title,
                  content: currentNote.content,
                }
              : note
          )
        );
      } else {
        // Add Note
        const res = await axios.post(
          "https://newnoteapp-3.onrender.com/api/notes",
          { title: currentNote.title, content: currentNote.content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes([...notes, res.data]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error(
        "Error saving note:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // Delete Note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`https://newnoteapp-3.onrender.com/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
      setViewModalOpen(false);
    } catch (error) {
      console.error(
        "Error deleting note:",
        error.response?.data || error.message
      );
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(currentNote.content)
      .then(() => alert("Note copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };
  

  return (
    <div className="main-notes-cont">
      <div className="notes-cont-head">
        <button onClick={openAddModal}>
          <IoAddCircleOutline />
        </button>
      </div>

      <div className="notes-container">
        {notes.map((note) => (
          <NoteItem key={note._id} note={note} openViewModal={openViewModal} />
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="create-note-modal">
          <div className="modal-content">
            <h3>{isEditing ? "Edit Note" : "Add Note"}</h3>
            <input
              value={currentNote.title}
              placeholder="Title"
              onChange={(e) =>
                setCurrentNote({ ...currentNote, title: e.target.value })
              }
            />
            <textarea
              value={currentNote.content}
              placeholder="Content"
              onChange={(e) =>
                setCurrentNote({ ...currentNote, content: e.target.value })
              }
            />
           <div className="buttons">
            <button onClick={() => setModalOpen(false)}><RxCross2 /></button>
           </div>
           <button onClick={handleSave} className="btn2">
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {viewModalOpen && (
  <div className="show-note-modal">
    <div className="note-modal-contents">
      <div className="note-modal-head">
        <h3>{currentNote.title}</h3>
        <div className="note-modal-actions">
          <button onClick={openEditModal}><MdEditNote /></button>
          <button onClick={handleCopy}><FaRegCopy /></button>
          <button onClick={() => deleteNote(currentNote.id)}><MdDelete /></button>
          <button onClick={() => setViewModalOpen(false)}><RxCross2 /></button>
        </div>
      </div>
      <div
  className="note-modal-content"
  style={{ whiteSpace: "pre-wrap" }}
  dangerouslySetInnerHTML={{
    __html: currentNote.content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    ),
  }}
></div>

    </div>
  </div>
)}

    </div>
  );
};

const NoteItem = ({ note, openViewModal }) => {
  return (
    <div className="note">
      <div className="note-head">
        <h3>{note.title}</h3>
        <MdOpenInNew
          className="open_icon"
          onClick={() => openViewModal(note)}
        />
      </div>
      <div className="note-content">
        <p style={{ whiteSpace: "pre-wrap" }}>
          {note.content.length < 250
            ? note.content
            : `${note.content.substring(0, 250)}...`}
        </p>
      </div>
    </div>
  );
};

export default Notes;
