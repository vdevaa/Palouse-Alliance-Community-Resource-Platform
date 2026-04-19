import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page page-root">
      <main className="page-shell admin-shell">
        <section className="page-hero admin-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-description">
            Manage member and admin accounts, register organizations, and handle other administrative tasks from one central place.
          </p>
        </section>

        <div className="admin-grid page-card-grid">
          <div className="page-card admin-card">
            <h2>Register Members & Admins</h2>
            <p>
              Create new member or administrator accounts and assign roles to support platform management.
            </p>
            <button
              type="button"
              className="navbar-link navbar-link-primary btn-primary admin-action-button"
              onClick={() => navigate("/register")}
            >
              Register users
            </button>
          </div>

          <div className="page-card admin-card">
            <h2>Register Organizations</h2>
            <p>
              Add new organizations to the Palouse Alliance directory and manage their presence in the community.
            </p>
            <button
              type="button"
              className="navbar-link navbar-link-primary btn-primary admin-action-button"
              disabled
            >
              Register organization
            </button>
          </div>

          <div className="page-card admin-card">
            <h2>Manage Event Status</h2>
            <p>
              Review and manage approved, pending, and rejected events.
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
      </main>
    </div>
  );
};

export default Admin;