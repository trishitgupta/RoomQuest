import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/auth/login", credentials);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
      
      navigate("/")
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
  };

  const handleReg = () => {
    navigate("/register");
  };

  const handleAdmin=()=>{
    //navigate("http://localhost:3001/login");
  }


  return (
    <div className="login">
      <div className="lContainer">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="lInput"
        />
        <button disabled={loading} onClick={handleClick} className="lButton">
          Login
        </button>
        <button disabled={loading} onClick={handleReg} className="rButton">
          Register
        </button>
        <button disabled={loading} onClick={handleAdmin} className="rButton">
        <Link to="http://localhost:3001/login" className="btn btn-primary"> Login as Admin</Link>
         
        </button>
        {error && <span>{error.message}</span>}
      </div>
    </div>
  );
};

export default Login;