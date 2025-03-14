import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    try {
      await axios.post("https://newnoteapp-3.onrender.com/api/auth/signup", {
        name,
        email,
        password,
      });
      alert("Account created successfully");
      navigate("/");
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main_cont">
      <form className="form">
        <span className="form_title">SignUp</span>
        <div className="flex-column">
          <label>Name </label>
        </div>
        <div className="inputForm">
          <input placeholder="Enter your Name" className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

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

        <button className="button-submit" onClick={handleSignup} type="button" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p className="p">Already have an account? <span className="span" onClick={() => navigate("/")}>Login</span></p>
      </form>
    </div>
  );
};

export default Signup;
