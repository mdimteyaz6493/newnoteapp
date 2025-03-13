import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      dispatch(setUser({ user: data.user, token: data.token }));
      navigate("/notes");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
   <div className="main_cont">
     <div className="login-cont">
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
   </div>
  );
};

export default Login;
