import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });

  const [userCredentials, setUserCredentials] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegChange = (e) => {
    setUserCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/auth/login", credentials);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });

      navigate("/");
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
  };

  // const handleReg = () => {
  //   navigate("/register");
  // };

  const handleAdmin = () => {
   // navigate("http://localhost:3001/login");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/register", userCredentials);
      // Handle success
      setLoading(false);
      toast.success("Register successful");
      navigate("/login");
    } catch (err) {
      // Handle failure
      setLoading(false);
      toast.error("Register failed");
      setError(err.response.data.message);
    }
  };

  return (
    // <div className="login">
    //   <div className="lContainer">
    //     <h1>Login</h1>
    //     <input
    //       type="text"
    //       placeholder="username"
    //       id="username"
    //       onChange={handleChange}
    //       className="lInput"
    //     />
    //     <input
    //       type="password"
    //       placeholder="password"
    //       id="password"
    //       onChange={handleChange}
    //       className="lInput"
    //     />
    //     <button disabled={loading} onClick={handleClick} className="lButton">
    //       Login
    //     </button>
    //     <button disabled={loading} onClick={handleReg} className="rButton">
    //       Register
    //     </button>
    //     <button disabled={loading} onClick={handleAdmin} className="rButton">
    //     <Link to="http://localhost:3001/login" className="btn btn-primary"> Login as Admin</Link>

    //     </button>
    //     {error && <span>{error.message}</span>}
    //   </div>
    // </div>

    <div className="parent">
      <h1 className="logo">RoomQuest</h1>
      <div className="container">
        <input type="checkbox" id="flip" />
        <div className="cover">
          <div className="front">
            <img
              src="https://images.unsplash.com/photo-1504681869696-d977211a5f4c?q=80&w=1852&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
            />
            <div className="text">
              <span className="text-1">
              Discover Your Next Escape:<br/> Unveil Unforgettable <br/>Stays with RoomQuest!
              </span>
              <span className="text-2">Let's get connected</span>
            </div>
          </div>
          <div className="back">
            {/*<img class="backImg" src="images/backImg.jpg" alt="">*/}
            <div className="text">
              <span className="text-1">
                Complete miles of journey <br /> with one step
              </span>
              <span className="text-2">Let's get started</span>
            </div>
          </div>
        </div>
        <div className="forms">
          <div className="form-content">
            <div className="login-form">
              <div className="title">Login</div>
              {/* <form action="POST"> */}
              <div className="input-boxes">
                <div className="input-box">
                  <i className="fas fa-envelope" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                    required=""
                    onChange={handleChange}
                  />
                </div>
                <div className="input-box">
                  <i className="fas fa-lock" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required=""
                    id="password"
                    onChange={handleChange}
                  />
                </div>
                <div className="text">
                  {/* <a href="#">Forgot password?</a> */}
                </div>
                <div className="button input-box">
                  <input
                    type="submit"
                    defaultValue="Sumbit"
                    disabled={loading}
                    onClick={handleClick}
                  />

                  {error && <span>{error.message}</span>}
                </div>
                <div className="button input-box" >
                  <button disabled={loading} onClick={handleAdmin} className="rButton" style={{ background: '#003580', padding: '10px', borderRadius: '5px' }}>
         <Link to="http://localhost:3001/login" className="" style={{ color: 'white', textDecoration: 'none' }}> Login as Admin</Link>
         </button>

                 
                </div>

                <div className="text sign-up-text">
                  Don't have an account?{" "}
                  <label htmlFor="flip">SignUp now</label>
                </div>
                {error && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "red",
                    }}
                  >
                    <span>{error.message}</span>
                  </div>
                )}
              </div>
              {/* </form> */}
            </div>
            <div className="signup-form">
              <div className="title">Sign-Up</div>
              {/* <form action="#"> */}
              <div className="input-boxes">
                <div className="input-box">
                  <i className="fas fa-user" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    required=""
                    id="username"
                    onChange={handleRegChange}
                  />
                </div>
                <div className="input-box">
                  <i className="fas fa-envelope" />
                  <input
                    type="text"
                    placeholder="Enter your email"
                    required=""
                    id="email"
                    onChange={handleRegChange}
                  />
                </div>
                <div className="input-box">
                  <i className="fas fa-lock" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required=""
                    id="password"
                    onChange={handleRegChange}
                  />
                </div>
                <div className="button input-box">
                  <input
                    type="submit"
                    defaultValue="Sumbit"
                    onClick={handleRegister}
                  />
                </div>

                <div className="text sign-up-text">
                  Already have an account?{" "}
                  <label htmlFor="flip">Login now</label>
                </div>
              </div>

              {/* </form> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
