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
import { ToastContainer, toast, Bounce, Slide } from "react-toastify";
import { BiSortDown } from "react-icons/bi";
import { BiSortUp } from "react-icons/bi";


const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showMenu, setshowMenu] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState("oldest"); // Sorting state
  const [uitheme, setuiTheme] = useState("light"); // Theme state
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
    setShowSort(false);
    setshowMenu(false);
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
      toast.error("Title and content are required!"); 
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
        toast.success("Note updated successfully!"); // ✅ Success toast for update
      } else {
        // Add Note
        const res = await axios.post(
          "https://newnoteapp-3.onrender.com/api/notes",
          { title: currentNote.title, content: currentNote.content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes([...notes, res.data]);
        toast.success("Note added successfully!"); // ✅ Success toast for add
      }
      setModalOpen(false);
    } catch (error) {
      console.error(
        "Error saving note:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Something went wrong");
      toast.error(error.response?.data?.message || "Something went wrong!"); // ❌ Error toast
    }
  };

   // 🔹 Function to Show Confirm Toast
   const handleDeleteClick = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="conf_div">
          <p>Are you sure you want to delete this note?</p>
          <button onClick={() => handleDelete(id, closeToast)}> Confirm </button>
          <button onClick={closeToast}> Cancel</button>
        </div>
      ),
      { position: "top-center", autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  // 🔹 Function to Delete Note
  const handleDelete = async (id, closeToast) => {
    try {
      await axios.delete(`https://newnoteapp-3.onrender.com/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
      closeToast(); // ✅ Close the confirm toast after deletion
      setViewModalOpen(false)
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note!");
    }
  };

  // Convert URLs to clickable links
  const convertToLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      part.match(urlRegex) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue" }}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };
  const handleCopy = () => {
    navigator.clipboard
      .writeText(currentNote.content)
      .then(() =>  toast.success("Note Copied!"))
      .catch((err) => console.error("Failed to copy:", err));
  };
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
            note._id === noteId
              ? { ...note, isFavorite: res.data.isFavorite }
              : note
          )
        );
        toast.success(res.data.isFavorite ? "Added to favourite!" : "Removed from favourite!");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };
  
  // ✅ Filter Notes based on Favorite Toggle
  const filteredNotes = showFavorites
    ? notes.filter((note) => note.isFavorite)
    : notes;

  const toggleTheme = () => {
    setuiTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={`main-notes-cont ${uitheme}`}>
     <button onClick={openAddModal} className="add_btn">
          <IoAddCircleOutline />
        </button>
      <div className="notes-cont-head">
        {showMenu ? (
          <IoMdClose
            className="menu_icon"
            onClick={() => setshowMenu((prev) => !prev)}
          />
        ) : (
          <IoMenu
            className="menu_icon"
            onClick={() => setshowMenu((prev) => !prev)}
          />
        )}
        <div className={showMenu ? "menu show" : "menu"}>
          <>
            <div className="num_notes">Total Notes : {notes.length}</div>
            <button
                onClick={() => setShowFavorites((prev) => !prev)}
                className="menu_btn"
              >
                {showFavorites ? "All Notes" : "Favorites"}
              </button>
              <button onClick={toggleTheme} className="menu_btn">
          {uitheme === "light" ? "Dark" : "Light"} Theme
        </button>
          </>
        </div>
      </div>

      <div className="notes-container">
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
            convertToLinks={convertToLinks}
            uitheme={uitheme}
          />
        ))}
      </div>
      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className={`create-note-modal ${uitheme}`}>
          <div className={`modal-content ${uitheme}`}>
            <span>{isEditing ? "Edit Note" : "Add Note"}</span>
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
              <button onClick={() => setModalOpen(false)}>
                <RxCross2 />
              </button>
            </div>
            <button onClick={handleSave} className="btn2">
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {viewModalOpen && (
        <div className="show-note-modal">
          <div className={`note-modal-contents ${uitheme}`}>
            <div className="note-modal-head">
              <span>{currentNote.title}</span>
              <div className="note-modal-actions">
                <button onClick={openEditModal}>
                  <MdEditNote />
                </button>
                <button onClick={handleCopy}>
                  <FaRegCopy />
                </button>
                <button onClick={() => handleDeleteClick(currentNote.id)}>
                  <MdDelete />
                </button>
                <button onClick={() => setViewModalOpen(false)}>
                  <RxCross2 />
                </button>
              </div>
            </div>
            <div
              className="note-modal-content"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {convertToLinks(currentNote.content)}
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-center"
        autoClose={1200}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        className="toast"
      />
    </div>
  );
};

// NoteItem Component
const NoteItem = ({
  note,
  openViewModal,
  convertToLinks,
  toggleFavorite,
  uitheme
  
}) => {

  return (
    <div className={`note ${uitheme}`} onClick={() => openViewModal(note)}>
      <div className="note-head">
        <h3>{note.title}</h3>
        <button onClick={() => toggleFavorite(note._id)} className="fav-btn">
          {note.isFavorite ? <IoMdHeart color="red" /> : <IoMdHeartEmpty />}
        </button>
      </div>
      <div className="note-content">
        <p style={{ whiteSpace: "pre-wrap" }}>
          {convertToLinks(
            note.content.length < 250
              ? note.content
              : `${note.content.substring(0, 250)}...`
          )}
        </p>
      </div>
    </div>
  );
};

export default Notes;
