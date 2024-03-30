import "./navbar.css";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user ,dispatch} = useContext(AuthContext);
  const navigate = useNavigate()
  const handleLogin=()=>{
    navigate("/login");
  }

  const handleLogout=()=>{
    
    dispatch({type:"LOGOUT"})
  }

  const handleReg=()=>{
    navigate("/register")
  }
  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="logo">RoomQuest</span>
        </Link>
        {user ? (
          <div>
          <span>Welcome, {user.username}</span>
          <button className="navButton" onClick={handleLogout}>
            Logout
          </button>
          </div>
        )  :(
          <div className="navItems">
            <button className="navButton" onClick={handleReg}>Register</button>
            <button className="navButton" onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
