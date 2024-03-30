import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { toast } from "sonner";

const Register = () => {
  const [userCredentials, setUserCredentials] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/register", userCredentials);
      // Handle success
      setLoading(false);
      toast.success("Register successful")
      navigate("/login");

    } catch (err) {
      // Handle failure
      setLoading(false);
      toast.error("Register failed")
      setError(err.response.data.message);
    }
  };

  

  return (
    <div className="register">
      <div className="rContainer">
        Register Here
        <input
          type="text"
          placeholder="Username"
          id="username"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          onChange={handleChange}
          className="rInput"
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          onChange={handleChange}
          className="rInput"
        />
        <button disabled={loading} onClick={handleRegister} className="rButton">
          Register
        </button>
        {error && <span>{error}</span>}
      </div>
    </div>
  );
};

export default Register;
