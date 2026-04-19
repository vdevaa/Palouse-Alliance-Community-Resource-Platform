import React, { useEffect, useState } from "react";
import Popup from "../components/Popup";
import FormField from "../components/FormField";
import { parseSupabaseDateTime } from "../lib/dateTime";
import { supabase } from "../lib/supabase";
import {
  ADMIN_UI_STATE_KEY,
  getSessionCacheValue,
  isSessionCacheFresh,
  readSessionCache,
  removeSessionCache,
  writeSessionCache,
} from "../lib/sessionCache";
import "../styles/Admin.css";
import "../styles/Login.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const ADMIN_CACHE_TTL_MS = 10 * 60 * 1000;
const ADMIN_ORGS_CACHE_KEY = "palouse:admin-orgs-cache";
const ADMIN_USERS_CACHE_KEY = "palouse:admin-users-cache";
const ADMIN_MANAGE_EVENTS_CACHE_KEY = "palouse:admin-manage-events-cache";

const emptyOrgForm = {
  name: "",
  description: "",
  phone_number: "",
  email: "",
  location: "",
};

const isValidEmail = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Admin = ({ session }) => {
  const sessionUserId = session?.user?.id || null;
  const persistedAdminState = getSessionCacheValue(readSessionCache(ADMIN_UI_STATE_KEY));

  const [orgPopupOpen, setOrgPopupOpen] = useState(() => persistedAdminState?.orgPopupOpen ?? false);
  const [registerOrgPopupOpen, setRegisterOrgPopupOpen] = useState(() => persistedAdminState?.registerOrgPopupOpen ?? false);
  const [userPopupOpen, setUserPopupOpen] = useState(() => persistedAdminState?.userPopupOpen ?? false);
  const [orgs, setOrgs] = useState(() => persistedAdminState?.orgs ?? []);
  const [currentUserId, setCurrentUserId] = useState(() => sessionUserId || persistedAdminState?.currentUserId || null);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState("");
  const [editingOrg, setEditingOrg] = useState(() => persistedAdminState?.editingOrg ?? null);
  const [orgForm, setOrgForm] = useState(() => persistedAdminState?.orgForm ?? emptyOrgForm);
  const [orgFieldErrors, setOrgFieldErrors] = useState(() => persistedAdminState?.orgFieldErrors ?? {});
  const [orgFormLoading, setOrgFormLoading] = useState(false);
  const [orgFormError, setOrgFormError] = useState(() => persistedAdminState?.orgFormError ?? "");
  const [deleteTarget, setDeleteTarget] = useState(() => persistedAdminState?.deleteTarget ?? null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState(() => persistedAdminState?.deleteUserTarget ?? null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [userManagePopupOpen, setUserManagePopupOpen] = useState(() => persistedAdminState?.userManagePopupOpen ?? false);
  const [users, setUsers] = useState(() => persistedAdminState?.users ?? []);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [editingUser, setEditingUser] = useState(() => persistedAdminState?.editingUser ?? null);
  const [userEditForm, setUserEditForm] = useState(() => persistedAdminState?.userEditForm ?? { role: "member", organization_id: "unaffiliated" });
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [userEditError, setUserEditError] = useState(() => persistedAdminState?.userEditError ?? "");

  const [manageEventsPopupOpen, setManageEventsPopupOpen] = useState(() => persistedAdminState?.manageEventsPopupOpen ?? false);
  const [manageEvents, setManageEvents] = useState(() => persistedAdminState?.manageEvents ?? []);
  const [manageEventsLoading, setManageEventsLoading] = useState(false);
  const [manageEventsError, setManageEventsError] = useState("");
  const [manageEventActionLoading, setManageEventActionLoading] = useState(() => persistedAdminState?.manageEventActionLoading ?? null);
  const [manageEventsSections, setManageEventsSections] = useState(() => persistedAdminState?.manageEventsSections ?? {
    pending: true,
    rejected: false,
    approved: false,
  });
  const [volunteerConfirmUrl, setVolunteerConfirmUrl] = useState(() => persistedAdminState?.volunteerConfirmUrl ?? "");

  const [registerOrgForm, setRegisterOrgForm] = useState(() => persistedAdminState?.registerOrgForm ?? emptyOrgForm);
  const [registerOrgFieldErrors, setRegisterOrgFieldErrors] = useState(() => persistedAdminState?.registerOrgFieldErrors ?? {});
  const [registerOrgLoading, setRegisterOrgLoading] = useState(false);
  const [registerOrgError, setRegisterOrgError] = useState(() => persistedAdminState?.registerOrgError ?? "");

  const [userForm, setUserForm] = useState(() => persistedAdminState?.userForm ?? {
    email: "",
    password: "",
    role: "member",
    organization_id: "unaffiliated",
  });
  const [userFieldErrors, setUserFieldErrors] = useState(() => persistedAdminState?.userFieldErrors ?? {});
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(() => persistedAdminState?.userError ?? "");
  const [resetPassword, setResetPassword] = useState(() => persistedAdminState?.resetPassword ?? "");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState(() => persistedAdminState?.resetPasswordError ?? "");
  const [resetPasswordCopied, setResetPasswordCopied] = useState(() => persistedAdminState?.resetPasswordCopied ?? false);
  const [resetPasswordPopupOpen, setResetPasswordPopupOpen] = useState(() => persistedAdminState?.resetPasswordPopupOpen ?? false);
  const [adminAlertPopupOpen, setAdminAlertPopupOpen] = useState(() => persistedAdminState?.adminAlertPopupOpen ?? false);
  const [adminAlertPopupTitle, setAdminAlertPopupTitle] = useState(() => persistedAdminState?.adminAlertPopupTitle ?? "");
  const [adminAlertPopupDescription, setAdminAlertPopupDescription] = useState(() => persistedAdminState?.adminAlertPopupDescription ?? "");
  const [adminAlertPopupMessage, setAdminAlertPopupMessage] = useState(() => persistedAdminState?.adminAlertPopupMessage ?? "");

  useEffect(() => {
    if (!sessionUserId) {
      removeSessionCache(ADMIN_UI_STATE_KEY);
    }
  }, [sessionUserId]);

  useEffect(() => {
    setCurrentUserId(sessionUserId || null);
  }, [sessionUserId]);

  useEffect(() => {
    writeSessionCache(ADMIN_UI_STATE_KEY, {
      orgPopupOpen,
      registerOrgPopupOpen,
      userPopupOpen,
      orgs,
      currentUserId,
      editingOrg,
      orgForm,
      orgFieldErrors,
      orgFormError,
      deleteTarget,
      deleteUserTarget,
      userManagePopupOpen,
      users,
      editingUser,
      userEditForm,
      userEditError,
      manageEventsPopupOpen,
      manageEvents,
      manageEventActionLoading,
      manageEventsSections,
      volunteerConfirmUrl,
      registerOrgForm,
      registerOrgFieldErrors,
      registerOrgError,
      userForm,
      userFieldErrors,
      userError,
      resetPassword,
      resetPasswordError,
      resetPasswordCopied,
      resetPasswordPopupOpen,
      adminAlertPopupOpen,
      adminAlertPopupTitle,
      adminAlertPopupDescription,
      adminAlertPopupMessage,
    });
  }, [
    orgPopupOpen,
    registerOrgPopupOpen,
    userPopupOpen,
    orgs,
    currentUserId,
    editingOrg,
    orgForm,
    orgFieldErrors,
    orgFormError,
    deleteTarget,
    deleteUserTarget,
    userManagePopupOpen,
    users,
    editingUser,
    userEditForm,
    userEditError,
    manageEventsPopupOpen,
    manageEvents,
    manageEventActionLoading,
    manageEventsSections,
    volunteerConfirmUrl,
    registerOrgForm,
    registerOrgFieldErrors,
    registerOrgError,
    userForm,
    userFieldErrors,
    userError,
    resetPassword,
    resetPasswordError,
    resetPasswordCopied,
    resetPasswordPopupOpen,
    adminAlertPopupOpen,
    adminAlertPopupTitle,
    adminAlertPopupDescription,
    adminAlertPopupMessage,
  ]);

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
    const cachedOrgsEntry = readSessionCache(ADMIN_ORGS_CACHE_KEY);
    const cachedOrgs = getSessionCacheValue(cachedOrgsEntry);

    if (Array.isArray(cachedOrgs)) {
      setOrgs(cachedOrgs);
    }

    if (Array.isArray(cachedOrgs) && isSessionCacheFresh(cachedOrgsEntry, ADMIN_CACHE_TTL_MS)) {
      setOrgsLoading(false);
      return;
    }

    setOrgsLoading(true);
    setOrgsError("");

    try {
      const response = await fetch(`${API_BASE}/api/organizations`);
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Failed to load organizations.");
      }
      const nextOrgs = Array.isArray(body) ? body : [];
      setOrgs(nextOrgs);
      writeSessionCache(ADMIN_ORGS_CACHE_KEY, nextOrgs);
    } catch (error) {
      setOrgsError(error.message || "Unable to load organizations.");
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    if (orgPopupOpen || userPopupOpen || registerOrgPopupOpen || userManagePopupOpen || manageEventsPopupOpen) {
      loadOrgs();
    }
  }, [orgPopupOpen, userPopupOpen, registerOrgPopupOpen, userManagePopupOpen, manageEventsPopupOpen]);

  useEffect(() => {
    if (userManagePopupOpen) {
      loadUsers();
    }
  }, [userManagePopupOpen]);

  useEffect(() => {
    if (manageEventsPopupOpen) {
      loadManageEvents();
    }
  }, [manageEventsPopupOpen]);

  async function loadUsers() {
    const cachedUsersEntry = readSessionCache(ADMIN_USERS_CACHE_KEY);
    const cachedUsers = getSessionCacheValue(cachedUsersEntry);

    if (Array.isArray(cachedUsers)) {
      setUsers(cachedUsers);
    }

    if (Array.isArray(cachedUsers) && isSessionCacheFresh(cachedUsersEntry, ADMIN_CACHE_TTL_MS)) {
      setUsersLoading(false);
      return;
    }

    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch(`${API_BASE}/api/users`);
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Failed to load users.");
      }
      const nextUsers = Array.isArray(body) ? body : [];
      setUsers(nextUsers);
      writeSessionCache(ADMIN_USERS_CACHE_KEY, nextUsers);
    } catch (error) {
      setUsersError(error.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadManageEvents() {
    const cachedEventsEntry = readSessionCache(ADMIN_MANAGE_EVENTS_CACHE_KEY);
    const cachedEvents = getSessionCacheValue(cachedEventsEntry);

    if (Array.isArray(cachedEvents)) {
      setManageEvents(cachedEvents);
    }

    if (Array.isArray(cachedEvents) && isSessionCacheFresh(cachedEventsEntry, ADMIN_CACHE_TTL_MS)) {
      setManageEventsLoading(false);
      return;
    }

    setManageEventsLoading(true);
    setManageEventsError("");

    try {
      const [eventResponse, tagResponse] = await Promise.all([
        supabase
          .from("events")
          .select(
            `
              id,
              title,
              description,
              start_datetime,
              end_datetime,
              location,
              volunteer_url,
              created_by,
              status,
              organization_id,
              category_id,
              created_at,
              organizations ( name ),
              categories ( name ),
              event_tags ( tag_id )
            `
          )
          .order("start_datetime", { ascending: true }),
        supabase.from("tags").select("id, name").order("name", { ascending: true }),
      ]);

      if (eventResponse.error) {
        throw eventResponse.error;
      }

      const tags = (tagResponse.data || []).reduce((lookup, tag) => {
        if (tag?.id && tag.name) {
          lookup[tag.id] = tag.name;
        }
        return lookup;
      }, {});

      const events = (eventResponse.data || []).map((event) => {
        const tagIds = Array.isArray(event.event_tags)
          ? event.event_tags.map((tagRow) => tagRow?.tag_id).filter(Boolean)
          : [];

        const eventTags = tagIds
          .map((tagId) => tags[tagId])
          .filter(Boolean);

        return {
          ...event,
          description: event.description || "",
          location: event.location || "",
          categoryName: event.categories?.name || null,
          organizationName: event.organizations?.name || null,
          tags: eventTags,
          tagIds,
          startDate: parseSupabaseDateTime(event.start_datetime),
          endDate: parseSupabaseDateTime(event.end_datetime),
        };
      });

      setManageEvents(events);
      writeSessionCache(ADMIN_MANAGE_EVENTS_CACHE_KEY, events);
    } catch (error) {
      setManageEventsError(error.message || "Unable to load event submissions.");
    } finally {
      setManageEventsLoading(false);
    }
  }

  const openManageEventsPopup = () => {
    setManageEventsSections({
      pending: true,
      rejected: false,
      approved: false,
    });
    setManageEventsPopupOpen(true);
  };

  const closeManageEventsPopup = () => {
    setManageEventsPopupOpen(false);
    setManageEvents([]);
    setManageEventsError("");
    setManageEventActionLoading(null);
    setVolunteerConfirmUrl("");
  };

  const toggleManageEventsSection = (sectionName) => {
    setManageEventsSections((currentSections) => {
      const isOpen = currentSections[sectionName];
      return {
        pending: false,
        rejected: false,
        approved: false,
        [sectionName]: !isOpen,
      };
    });
  };

  const openVolunteerConfirm = (url) => {
    setVolunteerConfirmUrl(url);
  };

  const closeVolunteerConfirm = () => {
    setVolunteerConfirmUrl("");
  };

  const confirmVolunteerLink = () => {
    if (!volunteerConfirmUrl) {
      return;
    }
    window.open(volunteerConfirmUrl, "_blank", "noopener,noreferrer");
    setVolunteerConfirmUrl("");
  };

  const formatEventTimestamp = (timestamp) => {
    const date = parseSupabaseDateTime(timestamp);
    if (!date) return "Unknown";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const updateEventStatus = async (eventId, status) => {
    setManageEventActionLoading(eventId);

    try {
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", eventId);

      if (error) {
        throw error;
      }

      setManageEvents((current) =>
        current.map((event) =>
          event.id === eventId ? { ...event, status } : event
        )
      );

      openAdminAlert({
        title: status === "approved" ? "Event Approved" : "Event Rejected",
        description: `The event has been ${status === "approved" ? "approved" : "rejected"}.`,
        message: `Event status updated successfully! Updates are visible to the public.`,
      });
    } catch (error) {
      openAdminAlert({
        title: "Event status update failed",
        description: "Unable to update event status.",
        message: error?.message || "Please try again.",
      });
    } finally {
      setManageEventActionLoading(null);
    }
  };

  const pendingManageEvents = manageEvents.filter((event) => {
    const statusKey = (event.status || "").toLowerCase();
    return statusKey === "pending" || statusKey === "";
  });

  const rejectedManageEvents = manageEvents.filter((event) => (event.status || "").toLowerCase() === "rejected");

  const approvedManageEvents = manageEvents.filter((event) => (event.status || "").toLowerCase() === "approved");

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
    } catch {
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
              onClick={openManageEventsPopup}
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
                  Back to List
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
                      <button
                        type="button"
                        className="btn-secondary icon-button"
                        onClick={() => handleEditClick(org)}
                        aria-label={`Edit ${org.name}`}
                        title={`Edit ${org.name}`}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-danger icon-button"
                        onClick={() => setDeleteTarget(org)}
                        aria-label={`Delete ${org.name}`}
                        title={`Delete ${org.name}`}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">delete</span>
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
                {registerOrgLoading ? "Creating..." : "Create Organization"}
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
                {userLoading ? "Creating..." : "Create User"}
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
                  Back to List
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
                        <button
                          type="button"
                          className="btn-secondary icon-button"
                          onClick={() => handleEditUserClick(user)}
                          aria-label={`Edit ${user.email}`}
                          title={`Edit ${user.email}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-danger icon-button"
                          onClick={() => setDeleteUserTarget(user)}
                          disabled={user.id === currentUserId}
                          aria-label={user.id === currentUserId ? "You cannot delete your own account." : `Delete ${user.email}`}
                          title={user.id === currentUserId ? "You cannot delete your own account." : `Delete ${user.email}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">delete</span>
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
      {manageEventsPopupOpen && (
        <Popup
          title="Manage Events"
          description="Review every event submission with full details, then approve or reject it."
          onClose={closeManageEventsPopup}
          className="regular-popup admin-popup"
        >
          {manageEventsLoading ? (
            <div className="admin-org-empty">Loading events...</div>
          ) : manageEventsError ? (
            <div className="admin-org-empty admin-org-error">{manageEventsError}</div>
          ) : manageEvents.length === 0 ? (
            <div className="admin-org-empty">No events available for review.</div>
          ) : (
            <div className="admin-events-list">
              {[
                { key: "pending", title: "Pending Events", items: pendingManageEvents },
                { key: "rejected", title: "Rejected Events", items: rejectedManageEvents },
                { key: "approved", title: "Approved Events", items: approvedManageEvents },
              ].map(({ key, title, items }) => (
                <section key={key} className="admin-events-group">
                  <button
                    type="button"
                    className="admin-events-group-toggle"
                    onClick={() => toggleManageEventsSection(key)}
                  >
                    <span>{title}</span>
                    <span className="admin-events-group-chevron">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {manageEventsSections[key] ? "expand_less" : "expand_more"}
                      </span>
                    </span>
                  </button>
                  {manageEventsSections[key] && (
                    <>
                      {items.length === 0 ? (
                        <p className="admin-events-group-empty">No {title.toLowerCase()}.</p>
                      ) : (
                        <div className="admin-events-group-list">
                      {items.map((event) => (
                        <div key={event.id} className="admin-event-card">
                          <div className="admin-event-card-header">
                            <div>
                              <h4>{event.title}</h4>
                              {(event.organizationName || event.categoryName) ? (
                                <p className="admin-event-meta">
                                  {[event.organizationName, event.categoryName].filter(Boolean).join(" · ")}
                                </p>
                              ) : null}
                            </div>
                            <div className="admin-event-status">{event.status || "Pending"}</div>
                          </div>
                          <div className="admin-event-detail-grid">
                            <div>
                              <strong>When</strong>
                              <p>{formatEventTimestamp(event.start_datetime)} — {formatEventTimestamp(event.end_datetime)}</p>
                            </div>
                            {event.location ? (
                              <div>
                                <strong>Location</strong>
                                <p>{event.location}</p>
                              </div>
                            ) : null}
                            {event.created_by ? (
                              <div>
                                <strong>Created By</strong>
                                <p>{event.created_by}</p>
                              </div>
                            ) : null}
                            {event.created_at ? (
                              <div>
                                <strong>Submitted</strong>
                                <p>{new Date(event.created_at).toLocaleString()}</p>
                              </div>
                            ) : null}
                            {event.volunteer_url ? (
                              <div>
                                <strong>Volunteer Link</strong>
                                <p>
                                  <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => openVolunteerConfirm(event.volunteer_url)}
                                  >
                                    View Link
                                  </button>
                                </p>
                              </div>
                            ) : null}
                            {event.tags?.length > 0 ? (
                              <div className="admin-event-tags-row">
                                <strong>Tags</strong>
                                <p>{event.tags.join(", ")}</p>
                              </div>
                            ) : null}
                          </div>
                          {event.description ? (
                            <div className="admin-event-description">
                              <strong>Description</strong>
                              <p>{event.description}</p>
                            </div>
                          ) : null}
                          <div className="popup-actions admin-event-actions">
                            {event.status?.toLowerCase() !== "approved" && (
                              <button
                                type="button"
                                className="btn-primary"
                                disabled={manageEventActionLoading === event.id}
                                onClick={() => updateEventStatus(event.id, "approved")}
                              >
                                {manageEventActionLoading === event.id ? "Updating..." : "Approve"}
                              </button>
                            )}
                            {event.status?.toLowerCase() !== "rejected" && (
                              <button
                                type="button"
                                className="btn-danger"
                                disabled={manageEventActionLoading === event.id}
                                onClick={() => updateEventStatus(event.id, "rejected")}
                              >
                                {manageEventActionLoading === event.id ? "Updating..." : event.status?.toLowerCase() === "approved" ? "Reject" : "Reject"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                      )}
                    </>
                  )}
                </section>
              ))}
            </div>
          )}
        </Popup>
      )}
      {volunteerConfirmUrl ? (
        <Popup
          title="Leave site?"
          description="You are about to leave the site to visit this event's volunteer page."
          onClose={closeVolunteerConfirm}
          className="dialog-popup"
          actions={
            <>
              <button type="button" className="secondary-btn" onClick={closeVolunteerConfirm}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={confirmVolunteerLink}>
                Continue
              </button>
            </>
          }
          ariaLabel="Leave site confirmation"
        >
          <p className="popup-description no-select">{volunteerConfirmUrl}</p>
        </Popup>
      ) : null}
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
                {resetPasswordCopied ? 'Copied Password' : 'Copy Password'}
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
