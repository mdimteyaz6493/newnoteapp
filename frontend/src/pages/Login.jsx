import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { ToastContainer, toast, Bounce, Slide } from "react-toastify";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    if(email=="" || password==""){
      toast.error("Email and password required")
      setLoading(false)
    }
    else{
      try {
        const { data } = await axios.post("https://newnoteapp-3.onrender.com/api/auth/login", { email, password });
        dispatch(setUser({ user: data.user, token: data.token }));
        // // alert("Login successfully");
        toast.success("Login Successfully")
        setTimeout(() => {
          navigate("/notes"); 
        }, 2000);
      } catch (error) {
        // alert(error.response.data.message);
        toast.error(error.response.data.message)
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="main_cont">
      <form className="form">
        <span className="form_title">Login</span>
        <div className="flex-column">
          <label>Email </label>
        </div>
        <div className="inputForm">
          <input placeholder="Enter your Email" className="input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex-column">
          <label>Password </label>
        </div>
        <div className="inputForm">
          <input placeholder="Enter your Password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="flex-row"></div>
        <button className="button-submit" onClick={handleLogin} type="button" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="p">Don't have an account? <span className="span" onClick={() => navigate("/signup")}>Signup</span></p>
      </form>
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

export default Login;
