import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Popup from "../components/Popup";
import FormField from "../components/FormField";
import loginLogo from "../assets/PalouseSquareLogo.png";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const clearFieldError = (name) => {
    setFieldErrors((current) => {
      const { [name]: _, ...rest } = current;
      return rest;
    });
  };

  const validateLogin = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    if (!validateLogin()) {
      return;
    }

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
            <FormField
              htmlFor="email"
              label="Email Address"
              error={fieldErrors.email}
              required
            >
              <input
                className="form-input"
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    clearFieldError("email");
                  }
                }}
                required
                autoComplete="email"
              />
            </FormField>

            <FormField
              htmlFor="password"
              label="Password"
              error={fieldErrors.password}
              required
              labelAction={
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setIsForgotPasswordOpen(true)}
                >
                  Forgot password?
                </button>
              }
            >
              <input
                className="form-input"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    clearFieldError("password");
                  }
                }}
                required
                autoComplete="current-password"
              />
            </FormField>

            <button
              className="login-button"
              type="submit"
              disabled={!email.trim() || !isValidEmail(email.trim()) || !password || fieldErrors.email || fieldErrors.password}
            >
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
