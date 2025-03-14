import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import "../styles/nav.css"
import { RiLogoutBoxRLine } from "react-icons/ri";


const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav>
      <div className="logo">
      <Link to="/notes" className="aa">Notes</Link>
      </div>
     <div className="menu">
     {token ? (
        <button onClick={handleLogout}><RiLogoutBoxRLine /></button>
      ) : (
        <>
          <Link to="/signup" className="aaa">Signup</Link>
        </>
      )}
     </div>
    </nav>
  );
};

export default Navbar;
