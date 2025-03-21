import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/notes.css";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOpenInNew, MdDelete, MdEditNote } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { FaRegCopy } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";





const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showMenu, setshowMenu] = useState(false)
  const [showSort, setShowSort] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState("oldest"); // Sorting state
  const [selectedColor, setSelectedColor] = useState("paper"); // Default yellow
  const [headcolor, setHeadcolor] = useState("#F4BB44");
  const [currentNote, setCurrentNote] = useState({
    id: null,
    title: "",
    content: "",
  });


  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

useEffect(() => {
  if (modalOpen || viewModalOpen || showMenu) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto"; // Cleanup on unmount
  };
}, [modalOpen, viewModalOpen, showMenu]);

  
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("https://newnoteapp-3.onrender.com/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sortedNotes = sortNotes(res.data, sortOrder);
        setNotes(sortedNotes);
      })
      .catch((err) => console.error("Error fetching notes:", err));
  }, [token, sortOrder]);

 // Sorting function
 const sortNotes = (notesArray, order) => {
  return [...notesArray].sort((a, b) => {
    return order === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  });
};
const handleSort = (order) => {
  setSortOrder(order);
  setShowSort(false)
  setshowMenu(false)
};

  // Function to handle color change (excluding paper change)
  const handleColorChange = (color) => {
    if (color === "paper") {
      setSelectedColor("paper");
      setHeadcolor("#F4BB44")
      return setShowColor(false), setshowMenu(false);
     

    }

    const colors = {
      yellow: "#F0E68C",
      green: "#ACE1AF",
      orange: "#FFE5B4",
      pink: "#FFC0CB",
      purple: "#E6E6FA",
    };

    const headColors = {
      yellow: "#FEBE10",
      green: "#1CAC78",
      orange: "#F89880",
      pink: "#F9629F",
      purple: "#CF9FFF",
      
    };

    setSelectedColor(colors[color] || "#FFFF00");
    setHeadcolor(headColors[color] || "#FEBE10");
    setShowColor(false);
    setshowMenu(false)

  };

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

  const deleteNote = async (id) => {
    try {
      await axios.delete(`https://newnoteapp-3.onrender.com/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
      setViewModalOpen(false);
    } catch (error) {
      console.error("Error deleting note:", error.response?.data || error.message);
    }
  };

  // Convert URLs to clickable links
  const convertToLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => 
      part.match(urlRegex) ? (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
          {part}
        </a>
      ) : (
        part
      )
    );
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(currentNote.content)
      .then(() => alert("Note copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };
  // ✅ Toggle Favorite Note
  const toggleFavorite = async (noteId) => {
    try {
      const res = await axios.put(
        `https://newnoteapp-3.onrender.com/api/notes/favorite/${noteId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId ? { ...note, isFavorite: res.data.isFavorite } : note
          )
        );
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  // ✅ Filter Notes based on Favorite Toggle
  const filteredNotes = showFavorites ? notes.filter((note) => note.isFavorite) : notes;

  return (
    <div className="main-notes-cont">
      <div className="notes-cont-head">
      {showMenu? <IoMdClose className="menu_icon" onClick={() => setshowMenu((prev) => !prev)}/>
        :<IoMenu  className="menu_icon" onClick={() => setshowMenu((prev) => !prev)}/>}
        <div className={showMenu ? "menu show":"menu"}>
      
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
            <button onClick={() => setShowFavorites((prev) => !prev)} className="menu_btn">
              {showFavorites ? "Show All Notes" : "Show Favorites ❤️"}
            </button>
          </div>
          </>
        </div>
      </div>

      <div className="notes-container">
      <button onClick={openAddModal} className="add_btn">
          <IoAddCircleOutline />
        </button>
        {/* {notes.map((note) => (
          <NoteItem 
            key={note._id} 
            note={note} 
            openViewModal={openViewModal} 
            selectedColor={selectedColor} 
            headcolor={headcolor} 
            convertToLinks={convertToLinks}
          />
        ))} */}
        {filteredNotes.map((note) => (
          <NoteItem
            key={note._id}
            note={note}
            toggleFavorite={toggleFavorite}
            openViewModal={openViewModal} 
            selectedColor={selectedColor} 
            headcolor={headcolor} 
            convertToLinks={convertToLinks}
          />
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
      
      {viewModalOpen && (
        <div className="show-note-modal">
          <div className="note-modal-contents">
            <div className="note-modal-head" >
              <h3>{currentNote.title}</h3>
              <div className="note-modal-actions">
                <button onClick={openEditModal}><MdEditNote /></button>
                <button onClick={handleCopy}><FaRegCopy /></button>
                <button onClick={() => deleteNote(currentNote.id)}><MdDelete /></button>
                <button onClick={() => setViewModalOpen(false)}><RxCross2 /></button>
              </div>
            </div>
            <div className="note-modal-content" style={{ whiteSpace: "pre-wrap" }}>
              {convertToLinks(currentNote.content)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// NoteItem Component
const NoteItem = ({ note, openViewModal, selectedColor, headcolor, convertToLinks ,toggleFavorite}) => {
  const backgroundStyle =
    selectedColor === "paper"
      ? { background: "repeating-linear-gradient(white, white 23px, #d3d3d3 25px)" }
      : { backgroundColor: selectedColor };

  return (
    <div className="note" style={backgroundStyle}>
      <div className="note-head" style={{ backgroundColor: headcolor }}>
        <h3>{note.title}</h3>
        <button onClick={() => toggleFavorite(note._id)} className="fav-btn">
            {note.isFavorite ? <IoMdHeart color="red" /> : <IoMdHeartEmpty />}
          </button>
        <MdOpenInNew className="open_icon" onClick={() => openViewModal(note)} />
      </div>
      <div className="note-content">
        <p style={{ whiteSpace: "pre-wrap" }}>
          {convertToLinks(note.content.length < 250 ? note.content : `${note.content.substring(0, 250)}...`)}
        </p>
      </div>
    </div>
  );
};

export default Notes;
