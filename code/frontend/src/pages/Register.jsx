import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/PalouseAlliance.avif";
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

    let createdAuthUser = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;
      createdAuthUser = authData.user;

      const { error: dbError } = await supabase
        .from("users")
        .insert([
          {
            id: createdAuthUser.id,
            role: form.role.toLowerCase(),
            organization_id: form.organization_id,
            wants_notifications: true,
          },
        ]);

      if (dbError) {
        if (createdAuthUser) {
          await supabase.auth.admin.deleteUser(createdAuthUser.id);
        }
        throw dbError;
      }

      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Registration failed");
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

          <h1 className="login-title">Register User</h1>
          <p className="login-subtitle">Complete all fields to create your account</p>

          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Email Address</label>
                </div>
                <input
                  name="email"
                  className="form-input"
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Password</label>
                </div>
                <input
                  name="password"
                  className="form-input"
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Role</label>
                </div>
                <select
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
                <div className="form-label-row">
                  <label className="form-label">Organization</label>
                </div>
                <select
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
  );
};

export default Register;