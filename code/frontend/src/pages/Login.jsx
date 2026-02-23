import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import PalouseLogo from "../assets/PalouseLogo.avif";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMP for Sprint 1 demo:
    // Replace later with Supabase auth
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <Navbar />

      <main className="login-main">
        <div className="login-card">
          <div className="login-logo">
            <img src={PalouseLogo} alt="Palouse Alliance Logo" />
          </div>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to your organization account to manage events <br />
            and connect with the community.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="form-input"
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <Link className="forgot-link" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <input
                className="form-input"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="login-button" type="submit">
              Sign In
            </button>

            <p className="login-footer-text">
              Don&apos;t have an account?{" "}
              <Link className="register-link" to="/register">
                Register your organization
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;