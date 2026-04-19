import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import logo from "../assets/PalouseTextLogo.png";
import "../styles/Login.css";

const RegisterOrganization = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone_number: "",
    email: "",
    location: "",
  });

  const isValidEmail = (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validate = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Organization name is required.";
    }

    if (form.email && !isValidEmail(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (name) => {
    setFieldErrors((current) => {
      const { [name]: _, ...rest } = current;
      return rest;
    });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (fieldErrors[name]) {
      clearFieldError(name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
      const resp = await fetch(`${API_BASE}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          phone_number: form.phone_number.trim() || null,
          email: form.email.trim() || null,
          location: form.location.trim() || null,
        }),
      });

      const body = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error((body && (body.message || body.error)) || "Organization registration failed.");
      }

      navigate("/admin");
    } catch (err) {
      setErrorMessage(err.message || "Organization registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card" style={{ maxWidth: "600px" }}>
          <div className="login-logo">
            <img src={logo} alt="Palouse Alliance" />
          </div>

          <h1 className="login-title">Register Organization</h1>
          <p className="login-subtitle">
            Add a new community organization to the Palouse Alliance directory.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField htmlFor="name" label="Organization Name" error={fieldErrors.name} required>
                <input
                  id="name"
                  name="name"
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </FormField>

              <FormField htmlFor="email" label="Contact Email" error={fieldErrors.email}>
                <input
                  id="email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                />
              </FormField>

              <FormField htmlFor="phone_number" label="Phone Number">
                <input
                  id="phone_number"
                  name="phone_number"
                  className="form-input"
                  type="tel"
                  value={form.phone_number}
                  onChange={onChange}
                />
              </FormField>

              <FormField htmlFor="location" label="Location">
                <input
                  id="location"
                  name="location"
                  className="form-input"
                  type="text"
                  value={form.location}
                  onChange={onChange}
                />
              </FormField>

              <FormField htmlFor="description" label="Description" className="full-width-field">
                <textarea
                  id="description"
                  name="description"
                  className="form-input"
                  rows="4"
                  value={form.description}
                  onChange={onChange}
                  style={{ minHeight: "112px", resize: "vertical" }}
                />
              </FormField>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading || !form.name.trim() || (form.email && !isValidEmail(form.email))}
            >
              {loading ? "Creating organization..." : "Create organization"}
            </button>

            {errorMessage && <div className="login-error-message">{errorMessage}</div>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterOrganization;
