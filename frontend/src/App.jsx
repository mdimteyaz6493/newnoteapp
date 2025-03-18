import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Notes from "./pages/Notes"
import Navbar from "./components/Navbar";
import ImageNote from "./pages/ImageNote";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/image" element={<ImageNote />} />
      </Routes>
    </>
  );
}

export default App;
