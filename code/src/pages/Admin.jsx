import React, { useEffect, useState } from "react";
import Popup from "../components/Popup";
import FormField from "../components/FormField";
import "../styles/Admin.css";
import "../styles/Login.css";

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
  const [orgPopupOpen, setOrgPopupOpen] = useState(false);
  const [registerOrgPopupOpen, setRegisterOrgPopupOpen] = useState(false);
  const [userPopupOpen, setUserPopupOpen] = useState(false);
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

  const [registerOrgForm, setRegisterOrgForm] = useState(emptyOrgForm);
  const [registerOrgFieldErrors, setRegisterOrgFieldErrors] = useState({});
  const [registerOrgLoading, setRegisterOrgLoading] = useState(false);
  const [registerOrgError, setRegisterOrgError] = useState("");

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    role: "member",
    organization_id: "",
  });
  const [userFieldErrors, setUserFieldErrors] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

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
    if (orgPopupOpen || userPopupOpen || registerOrgPopupOpen) {
      loadOrgs();
    }
  }, [orgPopupOpen, userPopupOpen, registerOrgPopupOpen]);

  const clearOrgFieldError = (name) => {
    setOrgFieldErrors((current) => {
      const { [name]: _, ...rest } = current;
      return rest;
    });
  };

  const clearRegisterOrgFieldError = (name) => {
    setRegisterOrgFieldErrors((current) => {
      const { [name]: _, ...rest } = current;
      return rest;
    });
  };

  const clearUserFieldError = (name) => {
    setUserFieldErrors((current) => {
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

  const handleRegisterOrgChange = (e) => {
    const { name, value } = e.target;
    setRegisterOrgForm((current) => ({ ...current, [name]: value }));
    if (registerOrgFieldErrors[name]) {
      clearRegisterOrgFieldError(name);
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((current) => ({ ...current, [name]: value }));
    if (userFieldErrors[name]) {
      clearUserFieldError(name);
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

  const validateRegisterOrg = () => {
    const errors = {};
    if (!registerOrgForm.name.trim()) {
      errors.name = "Organization name is required.";
    }
    if (registerOrgForm.email && !isValidEmail(registerOrgForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    setRegisterOrgFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserRegister = () => {
    const errors = {};
    if (!userForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!userForm.password) {
      errors.password = "Password is required.";
    } else if (userForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (!userForm.organization_id) {
      errors.organization_id = "Please select an organization.";
    }
    setUserFieldErrors(errors);
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

  const openRegisterOrgPopup = () => {
    setRegisterOrgPopupOpen(true);
  };

  const closeRegisterOrgPopup = () => {
    setRegisterOrgPopupOpen(false);
    setRegisterOrgForm(emptyOrgForm);
    setRegisterOrgFieldErrors({});
    setRegisterOrgError("");
  };

  const openUserPopup = () => {
    setUserPopupOpen(true);
  };

  const closeUserPopup = () => {
    setUserPopupOpen(false);
    setUserForm({
      email: "",
      password: "",
      role: "member",
      organization_id: "",
    });
    setUserFieldErrors({});
    setUserError("");
  };

  const handleRegisterOrgSubmit = async (event) => {
    event.preventDefault();
    setRegisterOrgError("");

    if (!validateRegisterOrg()) {
      return;
    }

    setRegisterOrgLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerOrgForm.name.trim(),
          description: registerOrgForm.description.trim() || null,
          phone_number: registerOrgForm.phone_number.trim() || null,
          email: registerOrgForm.email.trim() || null,
          location: registerOrgForm.location.trim() || null,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (body?.error === 'name_taken' || (body?.message && body.message.toLowerCase().includes('name')) ) {
          setRegisterOrgFieldErrors({ name: 'An organization with that name already exists.' });
          return;
        }
        throw new Error(body?.message || "Organization registration failed.");
      }
      closeRegisterOrgPopup();
      await loadOrgs();
    } catch (error) {
      setRegisterOrgError(error.message || "Organization registration failed.");
    } finally {
      setRegisterOrgLoading(false);
    }
  };

  const handleRegisterUser = async (event) => {
    event.preventDefault();
    setUserError("");

    if (!validateUserRegister()) {
      return;
    }

    setUserLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userForm.email.trim(),
          password: userForm.password,
          role: userForm.role.toLowerCase(),
          organization_id: userForm.organization_id,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message = body?.message || body?.error || "Registration failed.";
        throw new Error(message);
      }
      closeUserPopup();
    } catch (error) {
      setUserError(error.message || "Registration failed. Please try again.");
    } finally {
      setUserLoading(false);
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
              onClick={openUserPopup}
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
                onClick={openRegisterOrgPopup}
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
          className="regular-popup admin-popup"
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

      {registerOrgPopupOpen && (
        <Popup
          title="Register Organization"
          description="Add a new organization to the directory from this popup."
          onClose={closeRegisterOrgPopup}
          className="regular-popup admin-popup"
        >
          <form onSubmit={handleRegisterOrgSubmit}>
            <div className="form-grid admin-org-form-grid">
              <FormField htmlFor="register_name" label="Organization Name" error={registerOrgFieldErrors.name} required>
                <input
                  id="register_name"
                  name="name"
                  className="form-input"
                  type="text"
                  value={registerOrgForm.name}
                  onChange={handleRegisterOrgChange}
                  required
                />
              </FormField>
              <FormField htmlFor="register_email" label="Contact Email" error={registerOrgFieldErrors.email}>
                <input
                  id="register_email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={registerOrgForm.email}
                  onChange={handleRegisterOrgChange}
                />
              </FormField>
              <FormField htmlFor="register_phone_number" label="Phone Number">
                <input
                  id="register_phone_number"
                  name="phone_number"
                  className="form-input"
                  type="tel"
                  value={registerOrgForm.phone_number}
                  onChange={handleRegisterOrgChange}
                />
              </FormField>
              <FormField htmlFor="register_location" label="Location">
                <input
                  id="register_location"
                  name="location"
                  className="form-input"
                  type="text"
                  value={registerOrgForm.location}
                  onChange={handleRegisterOrgChange}
                />
              </FormField>
              <FormField htmlFor="register_description" label="Description" className="full-width-field">
                <textarea
                  id="register_description"
                  name="description"
                  className="form-input"
                  rows="4"
                  value={registerOrgForm.description}
                  onChange={handleRegisterOrgChange}
                  style={{ minHeight: "112px", resize: "vertical" }}
                />
              </FormField>
            </div>
            {registerOrgError && <p className="form-error-message">{registerOrgError}</p>}
            <div className="popup-actions">
              <button type="button" className="btn-secondary" onClick={closeRegisterOrgPopup}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={registerOrgLoading}>
                {registerOrgLoading ? "Creating..." : "Create organization"}
              </button>
            </div>
          </form>
        </Popup>
      )}

      {userPopupOpen && (
        <Popup
          title="Register User"
          description="Create a new member or admin account from this popup."
          onClose={closeUserPopup}
          className="regular-popup admin-popup"
        >
          <form onSubmit={handleRegisterUser}>
            <div className="form-grid admin-org-form-grid">
              <FormField htmlFor="register_email" label="Email Address" error={userFieldErrors.email} required>
                <input
                  id="register_email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  required
                />
              </FormField>
              <FormField htmlFor="register_password" label="Password" error={userFieldErrors.password} required>
                <input
                  id="register_password"
                  name="password"
                  className="form-input"
                  type="password"
                  value={userForm.password}
                  onChange={handleUserChange}
                  required
                />
              </FormField>
              <FormField htmlFor="register_role" label="Role" required>
                <select
                  id="register_role"
                  name="role"
                  className="form-input"
                  value={userForm.role}
                  onChange={handleUserChange}
                  required
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <FormField htmlFor="register_organization_id" label="Organization" error={userFieldErrors.organization_id} required>
                <select
                  id="register_organization_id"
                  name="organization_id"
                  className="form-input"
                  value={userForm.organization_id}
                  onChange={handleUserChange}
                  required
                >
                  <option value="" disabled>Select Organization</option>
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            {userError && <p className="form-error-message">{userError}</p>}
            <div className="popup-actions">
              <button type="button" className="btn-secondary" onClick={closeUserPopup}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={userLoading || orgsLoading}>
                {userLoading ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </Popup>
      )}
      {deleteTarget && (
        <Popup
          title="Confirm Delete"
          description={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
          className="dialog-popup admin-popup"
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
