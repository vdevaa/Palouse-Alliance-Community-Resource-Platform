import React, { useEffect, useState } from "react";
import Popup from "../components/Popup";
import FormField from "../components/FormField";
import { supabase } from "../lib/supabase";
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState("");
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgForm, setOrgForm] = useState(emptyOrgForm);
  const [orgFieldErrors, setOrgFieldErrors] = useState({});
  const [orgFormLoading, setOrgFormLoading] = useState(false);
  const [orgFormError, setOrgFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [userManagePopupOpen, setUserManagePopupOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ role: "member", organization_id: "unaffiliated" });
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [userEditError, setUserEditError] = useState("");

  const [registerOrgForm, setRegisterOrgForm] = useState(emptyOrgForm);
  const [registerOrgFieldErrors, setRegisterOrgFieldErrors] = useState({});
  const [registerOrgLoading, setRegisterOrgLoading] = useState(false);
  const [registerOrgError, setRegisterOrgError] = useState("");

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    role: "member",
    organization_id: "unaffiliated",
  });
  const [userFieldErrors, setUserFieldErrors] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [resetPasswordCopied, setResetPasswordCopied] = useState(false);
  const [resetPasswordPopupOpen, setResetPasswordPopupOpen] = useState(false);
  const [adminAlertPopupOpen, setAdminAlertPopupOpen] = useState(false);
  const [adminAlertPopupTitle, setAdminAlertPopupTitle] = useState("");
  const [adminAlertPopupDescription, setAdminAlertPopupDescription] = useState("");
  const [adminAlertPopupMessage, setAdminAlertPopupMessage] = useState("");

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
    if (orgPopupOpen || userPopupOpen || registerOrgPopupOpen || userManagePopupOpen) {
      loadOrgs();
    }
  }, [orgPopupOpen, userPopupOpen, registerOrgPopupOpen, userManagePopupOpen]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data?.session?.user?.id || null);
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (userManagePopupOpen) {
      loadUsers();
    }
  }, [userManagePopupOpen]);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch(`${API_BASE}/api/users`);
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Failed to load users.");
      }
      setUsers(Array.isArray(body) ? body : []);
    } catch (error) {
      setUsersError(error.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

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

  const handleUserEditChange = (e) => {
    const { name, value } = e.target;
    setUserEditForm((current) => ({ ...current, [name]: value }));
    if (userEditError) {
      setUserEditError("");
    }
  };

  const validateUserEdit = () => {
    const errors = {};
    if (!userEditForm.role || !['member', 'admin'].includes(userEditForm.role)) {
      errors.role = 'Please select a valid role.';
    }
    setUserEditError(errors.role || "");
    return Object.keys(errors).length === 0;
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setUserEditForm({
      role: user.role || 'member',
      organization_id: user.organization_id || 'unaffiliated',
    });
    setUserEditError("");
    setResetPassword("");
    setResetPasswordError("");
    setResetPasswordCopied(false);
    setResetPasswordPopupOpen(false);
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
    if (userForm.organization_id !== "unaffiliated" && !userForm.organization_id) {
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
      openAdminAlert({
        title: 'Organization updated',
        description: 'Organization details were saved successfully.',
        message: `${editingOrg.name || 'Organization'} updated successfully.`,
      });
    } catch (error) {
      if (error?.message?.includes('name_taken') || error?.message?.includes('already exists')) {
        setOrgFieldErrors({ name: 'An organization with that name already exists.' });
      } else {
        setOrgFormError(error.message || "Unable to update organization.");
        openAdminAlert({
          title: 'Organization update failed',
          description: 'Unable to save the organization.',
          message: error.message || "Unable to update organization.",
        });
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

  const openUserManagePopup = () => {
    setUserManagePopupOpen(true);
  };

  const closeUserPopup = () => {
    setUserPopupOpen(false);
    setUserForm({
      email: "",
      password: "",
      role: "member",
      organization_id: "unaffiliated",
    });
    setUserFieldErrors({});
    setUserError("");
  };

  const closeUserManagePopup = () => {
    setUserManagePopupOpen(false);
    setEditingUser(null);
    setUserEditForm({ role: "member", organization_id: "unaffiliated" });
    setUserEditError("");
    setResetPassword("");
    setResetPasswordError("");
    setResetPasswordCopied(false);
    setResetPasswordPopupOpen(false);
    setUsersError("");
    setDeleteUserTarget(null);
  };

  const openAdminAlert = ({ title, description, message }) => {
    setAdminAlertPopupTitle(title);
    setAdminAlertPopupDescription(description);
    setAdminAlertPopupMessage(message || "");
    setAdminAlertPopupOpen(true);
  };

  const closeAdminAlert = () => {
    setAdminAlertPopupOpen(false);
  };

  const handleRegisterOrgSubmit = async (event) => {
    event.preventDefault();
    setRegisterOrgError("");

    if (!validateRegisterOrg()) {
      return;
    }

    setRegisterOrgLoading(true);

    try {
      const organizationName = registerOrgForm.name.trim();
      const response = await fetch(`${API_BASE}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: organizationName,
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
      openAdminAlert({
        title: 'Organization registered',
        description: 'The new organization was added successfully.',
        message: `${organizationName} has been created.`,
      });
    } catch (error) {
      setRegisterOrgError(error.message || "Organization registration failed.");
      openAdminAlert({
        title: 'Organization registration failed',
        description: 'Unable to register the organization.',
        message: error.message || "Organization registration failed.",
      });
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
      const newUserEmail = userForm.email.trim();
      const response = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: userForm.password,
          role: userForm.role.toLowerCase(),
          organization_id: userForm.organization_id === "unaffiliated" ? null : userForm.organization_id,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message = body?.message || body?.error || "Registration failed.";
        throw new Error(message);
      }
      closeUserPopup();
      openAdminAlert({
        title: 'User registered',
        description: 'The account was created successfully.',
        message: `${newUserEmail} has been registered.`,
      });
    } catch (error) {
      setUserError(error.message || "Registration failed. Please try again.");
      openAdminAlert({
        title: 'User registration failed',
        description: 'Unable to create the user account.',
        message: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserUpdate = async (event) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    if (!validateUserEdit()) {
      return;
    }

    setUserEditLoading(true);
    setUserEditError("");

    try {
      const response = await fetch(`${API_BASE}/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userEditForm.role,
          organization_id: userEditForm.organization_id === 'unaffiliated' ? null : userEditForm.organization_id,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Unable to update user.");
      }
      await loadUsers();
      setEditingUser(null);
      openAdminAlert({
        title: 'User updated',
        description: 'The user profile was saved successfully.',
        message: `${editingUser.email || 'User'} updated successfully.`,
      });
    } catch (error) {
      setUserEditError(error.message || "Unable to update user.");
      openAdminAlert({
        title: 'User update failed',
        description: 'Unable to save the user changes.',
        message: error.message || "Unable to update user.",
      });
    } finally {
      setUserEditLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser) {
      return;
    }

    setResetPasswordLoading(true);
    setResetPasswordError("");
    setResetPasswordCopied(false);

    try {
      const response = await fetch(`${API_BASE}/api/users/${editingUser.id}/reset-password`, {
        method: "POST",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Unable to reset password.");
      }
      setResetPassword(body?.password || "");
      setResetPasswordPopupOpen(true);
    } catch (error) {
      setResetPasswordError(error.message || "Unable to reset password.");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!resetPassword) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resetPassword);
      setResetPasswordCopied(true);
    } catch (error) {
      setResetPasswordError("Unable to copy the password automatically. Please copy it manually.");
    }
  };

  const handleDeleteOrg = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      const deletedOrganizationName = deleteTarget?.name || 'Organization';
      const response = await fetch(`${API_BASE}/api/organizations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Unable to delete organization.");
      }
      await loadOrgs();
      setDeleteTarget(null);
      openAdminAlert({
        title: 'Organization deleted',
        description: 'The organization was removed successfully.',
        message: `${deletedOrganizationName} has been deleted.`,
      });
    } catch (error) {
      setDeleteTarget(null);
      setOrgsError(error.message || "Unable to delete organization.");
      openAdminAlert({
        title: 'Organization delete failed',
        description: 'Unable to delete the organization.',
        message: error.message || "Unable to delete organization.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget || deleteUserTarget.id === currentUserId) {
      setDeleteUserTarget(null);
      return;
    }

    setDeleteUserLoading(true);

    try {
      const deletedUserEmail = deleteUserTarget?.email || 'User';
      const response = await fetch(`${API_BASE}/api/users/${deleteUserTarget.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Unable to delete user.");
      }
      await loadUsers();
      setDeleteUserTarget(null);
      openAdminAlert({
        title: 'User deleted',
        description: 'The user account was removed successfully.',
        message: `${deletedUserEmail} has been deleted.`,
      });
    } catch (error) {
      setDeleteUserTarget(null);
      setUsersError(error.message || "Unable to delete user.");
      openAdminAlert({
        title: 'User delete failed',
        description: 'Unable to delete the user account.',
        message: error.message || "Unable to delete user.",
      });
    } finally {
      setDeleteUserLoading(false);
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
            <div className="admin-card-actions-row">
              <button
                type="button"
                className="navbar-link navbar-link-primary btn-primary admin-action-button"
                onClick={openUserPopup}
              >
                Register User
              </button>
              <button
                type="button"
                className="navbar-link navbar-link-secondary admin-action-button"
                onClick={openUserManagePopup}
              >
                Manage Users
              </button>
            </div>
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
              <FormField htmlFor="register_organization_id" label="Organization" error={userFieldErrors.organization_id}>
                <select
                  id="register_organization_id"
                  name="organization_id"
                  className="form-input"
                  value={userForm.organization_id}
                  onChange={handleUserChange}
                >
                  <option value="unaffiliated">Unaffiliated</option>
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
      {userManagePopupOpen && (
        <Popup
          title={editingUser ? "Edit User" : "Manage Users"}
          description={
            editingUser
              ? "Change user role and organization assignment here. Email cannot be changed through this admin panel."
              : "View all registered users and edit their role or delete the account."
          }
          onClose={closeUserManagePopup}
          className="regular-popup admin-popup"
        >
          {editingUser ? (
            <form onSubmit={handleUserUpdate}>
              <div className="form-grid admin-org-form-grid">
                <FormField htmlFor="edit_user_email" label="Email Address">
                  <input
                    id="edit_user_email"
                    name="email"
                    className="form-input"
                    type="email"
                    value={editingUser.email}
                    readOnly
                  />
                </FormField>
                <FormField htmlFor="edit_user_role" label="Role" error={userEditError} required>
                  <select
                    id="edit_user_role"
                    name="role"
                    className="form-input"
                    value={userEditForm.role}
                    onChange={handleUserEditChange}
                    required
                    disabled={editingUser?.id === currentUserId}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </FormField>
                <FormField htmlFor="edit_user_organization_id" label="Organization">
                  <select
                    id="edit_user_organization_id"
                    name="organization_id"
                    className="form-input"
                    value={userEditForm.organization_id}
                    onChange={handleUserEditChange}
                  >
                    <option value="unaffiliated">Unaffiliated</option>
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              {userEditError && <p className="form-error-message">{userEditError}</p>}
              {resetPasswordError && <p className="form-error-message">{resetPasswordError}</p>}
              <div className="popup-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                  Back to list
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading || userEditLoading}
                >
                  {resetPasswordLoading ? "Resetting..." : "Reset Password"}
                </button>
                <button type="submit" className="btn-primary" disabled={userEditLoading}>
                  {userEditLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="admin-org-list">
              {usersLoading ? (
                <div className="admin-org-empty">Loading users...</div>
              ) : usersError ? (
                <div className="admin-org-empty admin-org-error">{usersError}</div>
              ) : users.length === 0 ? (
                <div className="admin-org-empty">No users available.</div>
              ) : (
                users.map((user) => {
                  const organizationName = orgs.find((org) => org.id === user.organization_id)?.name || "No organization";
                  return (
                    <div key={user.id} className="admin-org-row">
                      <div>
                        <span className="admin-org-row-name">{user.email}</span>
                        <div className="admin-user-meta">{user.role} · {organizationName}</div>
                      </div>
                      <div className="admin-org-actions">
                        <button type="button" className="btn-secondary" onClick={() => handleEditUserClick(user)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => setDeleteUserTarget(user)}
                          disabled={user.id === currentUserId}
                          title={user.id === currentUserId ? "You cannot delete your own account." : undefined}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="popup-actions">
                <button type="button" className="btn-secondary" onClick={closeUserManagePopup}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Popup>
      )}
      {resetPasswordPopupOpen && (
        <Popup
          title="Password Reset"
          description="A secure temporary password was generated. Copy it and share it with the user safely."
          onClose={() => setResetPasswordPopupOpen(false)}
          className="dialog-popup admin-popup"
          actions={
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setResetPasswordPopupOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyPassword}
                disabled={!resetPassword}
              >
                {resetPasswordCopied ? 'Copied' : 'Copy password'}
              </button>
            </>
          }
        >
          <div className="form-grid admin-org-form-grid">
            <FormField htmlFor="reset_password_preview" label="Temporary Password">
              <input
                id="reset_password_preview"
                className="form-input"
                type="text"
                value={resetPassword}
                readOnly
              />
            </FormField>
          </div>
          {resetPasswordCopied && <p className="popup-description">Password copied to clipboard.</p>}
        </Popup>
      )}
      {adminAlertPopupOpen && (
        <Popup
          title={adminAlertPopupTitle}
          description={adminAlertPopupDescription}
          onClose={closeAdminAlert}
          className="dialog-popup admin-popup"
          actions={
            <button type="button" className="btn-primary" onClick={closeAdminAlert}>
              Close
            </button>
          }
        >
          <p>{adminAlertPopupMessage}</p>
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
      {deleteUserTarget && (
        <Popup
          title="Confirm Delete"
          description={`Are you sure you want to delete ${deleteUserTarget.email}? This action cannot be undone.`}
          onClose={() => setDeleteUserTarget(null)}
          className="dialog-popup admin-popup"
          actions={
            <>
              <button type="button" className="btn-secondary" onClick={() => setDeleteUserTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleDeleteUser} disabled={deleteUserLoading}>
                {deleteUserLoading ? "Deleting..." : "Delete"}
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

export default Admin;
