import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import FormField from "../components/FormField";
import "../styles/Admin.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const emptyOrgForm = {
  name: "",
  description: "",
  phone_number: "",
  email: "",
  location: "",
};

const isValidEmail = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Admin = () => {
  const navigate = useNavigate();
  const [orgPopupOpen, setOrgPopupOpen] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState("");
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgForm, setOrgForm] = useState(emptyOrgForm);
  const [orgFieldErrors, setOrgFieldErrors] = useState({});
  const [orgFormLoading, setOrgFormLoading] = useState(false);
  const [orgFormError, setOrgFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openOrgPopup = () => {
    setOrgPopupOpen(true);
  };

  const closeOrgPopup = () => {
    setOrgPopupOpen(false);
    setEditingOrg(null);
    setOrgForm(emptyOrgForm);
    setOrgFieldErrors({});
    setOrgFormError("");
    setOrgsError("");
    setDeleteTarget(null);
  };

  const loadOrgs = async () => {
    setOrgsLoading(true);
    setOrgsError("");

    try {
      const response = await fetch(`${API_BASE}/api/organizations`);
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Failed to load organizations.");
      }
      setOrgs(Array.isArray(body) ? body : []);
    } catch (error) {
      setOrgsError(error.message || "Unable to load organizations.");
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    if (orgPopupOpen) {
      loadOrgs();
    }
  }, [orgPopupOpen]);

  const clearOrgFieldError = (name) => {
    setOrgFieldErrors((current) => {
      const { [name]: _, ...rest } = current;
      return rest;
    });
  };

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgForm((current) => ({ ...current, [name]: value }));
    if (orgFieldErrors[name]) {
      clearOrgFieldError(name);
    }
  };

  const validateOrgForm = () => {
    const errors = {};
    if (!orgForm.name.trim()) {
      errors.name = "Organization name is required.";
    }
    if (orgForm.email && !isValidEmail(orgForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    setOrgFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditClick = (org) => {
    setEditingOrg(org);
    setOrgForm({
      name: org.name || "",
      description: org.description || "",
      phone_number: org.phone_number || "",
      email: org.email || "",
      location: org.location || "",
    });
    setOrgFieldErrors({});
    setOrgFormError("");
  };

  const handleOrgUpdate = async (event) => {
    event.preventDefault();
    if (!editingOrg) {
      return;
    }

    if (!validateOrgForm()) {
      return;
    }

    setOrgFormLoading(true);
    setOrgFormError("");

    try {
      const response = await fetch(`${API_BASE}/api/organizations/${editingOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgForm.name.trim(),
          description: orgForm.description.trim() || null,
          phone_number: orgForm.phone_number.trim() || null,
          email: orgForm.email.trim() || null,
          location: orgForm.location.trim() || null,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Unable to update organization.");
      }
      await loadOrgs();
      setEditingOrg(null);
      setOrgForm(emptyOrgForm);
    } catch (error) {
      if (error?.message?.includes('name_taken') || error?.message?.includes('already exists')) {
        setOrgFieldErrors({ name: 'An organization with that name already exists.' });
      } else {
        setOrgFormError(error.message || "Unable to update organization.");
      }
    } finally {
      setOrgFormLoading(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/organizations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Unable to delete organization.");
      }
      await loadOrgs();
      setDeleteTarget(null);
    } catch (error) {
      setDeleteTarget(null);
      setOrgsError(error.message || "Unable to delete organization.");
    } finally {
      setDeleteLoading(false);
    }
  };

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
            <h2>Manage Members & Admins</h2>
            <p>
              Create new member or administrator accounts and assign roles to support platform management.
            </p>
            <button
              type="button"
              className="navbar-link navbar-link-primary btn-primary admin-action-button"
              onClick={() => navigate("/register")}
            >
              Register User
            </button>
          </div>
          <div className="page-card admin-card">
            <h2>Manage Organizations</h2>
            <p>
              Add new organizations to the Palouse Alliance directory and manage their presence in the community.
            </p>
            <div className="admin-card-actions-row">
              <button
                type="button"
                className="navbar-link navbar-link-primary btn-primary admin-action-button"
                onClick={() => navigate("/register-organization")}
              >
                Register Organization
              </button>
              <button
                type="button"
                className="navbar-link navbar-link-secondary admin-action-button"
                onClick={openOrgPopup}
              >
                Manage Organizations
              </button>
            </div>
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
      {orgPopupOpen && (
        <Popup
          title={editingOrg ? "Edit Organization" : "Manage Organizations"}
          description={
            editingOrg
              ? "Update the org details below and save changes."
              : "View all organizations and choose a name to edit or delete."
          }
          onClose={closeOrgPopup}
          className="admin-popup"
        >
          {editingOrg ? (
            <form onSubmit={handleOrgUpdate}>
              <div className="form-grid admin-org-form-grid">
                <FormField htmlFor="name" label="Organization Name" error={orgFieldErrors.name} required>
                  <input
                    id="name"
                    name="name"
                    className="form-input"
                    type="text"
                    value={orgForm.name}
                    onChange={handleOrgChange}
                    required
                  />
                </FormField>
                <FormField htmlFor="email" label="Contact Email" error={orgFieldErrors.email}>
                  <input
                    id="email"
                    name="email"
                    className="form-input"
                    type="email"
                    value={orgForm.email}
                    onChange={handleOrgChange}
                  />
                </FormField>
                <FormField htmlFor="phone_number" label="Phone Number">
                  <input
                    id="phone_number"
                    name="phone_number"
                    className="form-input"
                    type="tel"
                    value={orgForm.phone_number}
                    onChange={handleOrgChange}
                  />
                </FormField>
                <FormField htmlFor="location" label="Location">
                  <input
                    id="location"
                    name="location"
                    className="form-input"
                    type="text"
                    value={orgForm.location}
                    onChange={handleOrgChange}
                  />
                </FormField>
                <FormField htmlFor="description" label="Description" className="full-width-field">
                  <textarea
                    id="description"
                    name="description"
                    className="form-input"
                    rows="4"
                    value={orgForm.description}
                    onChange={handleOrgChange}
                    style={{ minHeight: "112px", resize: "vertical" }}
                  />
                </FormField>
              </div>
              {orgFormError && <p className="form-error-message">{orgFormError}</p>}
              <div className="popup-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingOrg(null)}>
                  Back to list
                </button>
                <button type="submit" className="btn-primary" disabled={orgFormLoading}>
                  {orgFormLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="admin-org-list">
              {orgsLoading ? (
                <div className="admin-org-empty">Loading organizations...</div>
              ) : orgsError ? (
                <div className="admin-org-empty admin-org-error">{orgsError}</div>
              ) : orgs.length === 0 ? (
                <div className="admin-org-empty">No organizations available.</div>
              ) : (
                orgs.map((org) => (
                  <div key={org.id} className="admin-org-row">
                    <span className="admin-org-row-name">{org.name}</span>
                    <div className="admin-org-actions">
                      <button type="button" className="btn-secondary" onClick={() => handleEditClick(org)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger" onClick={() => setDeleteTarget(org)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="popup-actions">
                <button type="button" className="btn-secondary" onClick={closeOrgPopup}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Popup>
      )}
      {deleteTarget && (
        <Popup
          title="Confirm Delete"
          description={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
          className="admin-popup"
          actions={
            <>
              <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleDeleteOrg} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

export default Admin;
