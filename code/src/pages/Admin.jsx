import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page page-root">
      <div className="admin-shell">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage member and admin accounts, register organizations, and handle other administrative tasks from one central place.
          </p>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h2>Register Members & Admins</h2>
            <p>
              Create new member or administrator accounts and assign roles to support platform management.
            </p>
            <button
              type="button"
              className="navbar-link navbar-link-primary btn-primary admin-action-button"
              onClick={() => navigate("/register")}
            >
              Register Users
            </button>
          </div>

          <div className="admin-card">
            <h2>Register Organizations</h2>
            <p>
              Add new organizations to the Palouse Alliance directory and manage their presence in the community.
            </p>
            <button
              type="button"
              className="navbar-link navbar-link-primary btn-primary admin-action-button"
              disabled
            >
              Register Organization
            </button>
          </div>

          <div className="admin-card">
            <h2>Admin Tools</h2>
            <p>
              Review approved, pending, and rejected events.
            </p>
            <button
              type="button"
              className="navbar-link navbar-link-primary btn-primary admin-action-button"
              disabled
            >
              Manage Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;