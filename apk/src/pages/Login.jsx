import React, { useState } from "react";
import '../styles/Login.css';
// import axios from 'axios'; // Using API utility instead
// import logo from '../assets/logo.png' // Unused import
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import API from "../utils/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await API.post('/user/login', formData);
      
      // Check if login was successful
      if (response.data.success) {
        const {accesstoken, userId} = response.data;
        
        // Store the token in local storage
        localStorage.setItem('accessToken', accesstoken);
        localStorage.setItem('userId', userId);
        
        // Navigate to home page
        navigate("/home");
      } else {
        // If the login failed, show error message
        setError(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <div className="login-phone-frame">
          <img src="https://user-images.githubusercontent.com/65025954/187060767-32c69d56-05d4-45ea-85da-0de67f054510.png" alt="Phone frame" className="phone-frame" />
        </div>
      </div>
      <div className="login-right-panel">
        <div className="login-content">
          <div className="login-card">
            <div className="logo-container">
              <h1 className="app-logo">Rizzit</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message-login">{error}</div>}
              
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
              </div>
              
              <div className="input-group-password">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ?<VisibilityIcon />  :<VisibilityOffIcon /> }
                </span>
              </div>
              
              <button type="submit" disabled={loading} className="login-button">
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="login-footer">
              <p className="signup-link">
                Don't have an account? <a href="/register" className="signup-link-text">Sign up</a>
              </p>
            </div>
          </div>
          
          <div className="get-app">
            <p>Get the app.</p>
            <div className="app-stores">
              <button className="app-store-link">
                <img src="https://www.apple.com/newsroom/images/values/app-store/Apple-Newsroom-App-Store-download-hero-20220912_inline.jpg.avif" alt="App Store" className="app-store-img" />
              </button>
              <button className="app-store-link">
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968678.png" alt="Google Play" className="app-store-img" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;