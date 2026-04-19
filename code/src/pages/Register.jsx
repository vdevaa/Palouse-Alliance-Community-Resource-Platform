import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/PalouseTextLogo.png";
import "../styles/Login.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [organizations, setOrganizations] = useState([]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "member",
    organization_id: "",
  });

  const [checkingAuth, setCheckingAuth] = useState(true);

  // Ensure only logged-in admins can access this page
  useEffect(() => {
    let mounted = true;
    const ensureAdmin = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (!currentSession) {
        navigate("/login");
        return;
      }

      const userId = currentSession.user?.id;
      if (!userId) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;
      if (error || !data || data.role !== "admin") {
        navigate("/");
        return;
      }

      setCheckingAuth(false);
    };

    ensureAdmin();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name", { ascending: true });
      
      if (!error && data) {
        setOrganizations(data);
      }
    };
    fetchOrgs();
  }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Send registration request to backend which uses the Supabase service role key
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const resp = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role.toLowerCase(),
          organization_id: form.organization_id,
        }),
      });

      const body = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error((body && (body.message || body.error)) || 'Registration failed');
      }

      navigate("/");

    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    checkingAuth ? (
      <div style={{ padding: "2rem" }}>Checking permissions...</div>
    ) : (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card" style={{ maxWidth: "600px" }}>
          
          <div className="login-logo">
            <img src={logo} alt="Palouse Alliance" />
          </div>

          <h1 className="login-title">Register User</h1>
          <p className="login-subtitle">Complete all fields to create your account</p>

          <form onSubmit={handleRegister}>
            <div className="form-grid">
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-input"
                  value={form.role}
                  onChange={onChange}
                  required
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="organization_id" className="form-label">Organization</label>
                <select
                  id="organization_id"
                  name="organization_id"
                  className="form-input"
                  value={form.organization_id}
                  onChange={onChange}
                  required
                >
                  <option value="" disabled>Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>

            {errorMessage && (
              <p className="login-error-message">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  ));
};

export default Register;