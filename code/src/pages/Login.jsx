import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Popup from "../components/Popup";
import loginLogo from "../assets/PalouseSquareLogo.png";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message || "Invalid email or password.");
      return;
    }

    navigate("/");
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card">
          <div className="login-logo">
            <img src={loginLogo} alt="Palouse Alliance Logo" />
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
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setIsForgotPasswordOpen(true)}
                >
                  Forgot password?
                </button>
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

            {errorMessage && (
              <p className="login-error-message" role="alert">
                {errorMessage}
              </p>
            )}
          </form>

          {isForgotPasswordOpen ? (
            <Popup
              title="Password reset help"
              description="Contact Palouse Alliance to reset your password and regain access to your account."
              onClose={() => setIsForgotPasswordOpen(false)}
              actions={
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setIsForgotPasswordOpen(false)}
                >
                  Close
                </button>
              }
              ariaLabel="Forgot password help"
            >
              <p className="login-forgot-body">
                Please reach out to Palouse Alliance to reset your password. They will be able to verify
                your account and walk you through the next steps.
              </p>
            </Popup>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Login;
