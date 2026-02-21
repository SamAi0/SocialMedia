import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
// import axios from 'axios'; // Using API utility instead
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import API from '../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isFormValid = formData.name && formData.email && formData.password;

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
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Invalid email address.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await API.post("/user/register", formData);
      if(response.data.success) {
        alert(response.data.message);
        navigate("/");
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left-panel">
        <div className="login-phone-frame">
          <img src="https://user-images.githubusercontent.com/65025954/187060767-32c69d56-05d4-45ea-85da-0de67f054510.png" alt="Phone frame" className="phone-frame" />
        </div>
      </div>
      <div className="register-right-panel">
        <div className="register-content">
          <div className="register-card">
            <div className="logo-container">
              <h1 className="app-logo">Rizzit</h1>
            </div>
            
            <p className="register-subtitle">Sign up to see photos and videos from your friends.</p>
            
            <form onSubmit={handleSubmit} className="register-form">
              {error && <div className="error-message-register">{error}</div>}
              
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="register-input"
                />
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="register-input"
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
                  className="register-input"
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ?  <VisibilityIcon /> : <VisibilityOffIcon />}
                </span>
              </div>
              
              <button type="submit" disabled={!isFormValid || loading} className="register-button">
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="register-footer">
              <p className="login-link">
                Have an account? <a href="/" className="login-link-text">Log in</a>
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