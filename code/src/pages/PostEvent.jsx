import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import uploadIcon from "../assets/upload-icon.png";
import { supabase } from "../lib/supabase";
import FormField from "../components/FormField";
import "../styles/PostEvent.css";

const FALLBACK_CATEGORY_NAMES = [
  "Community Events",
  "Crisis Support",
  "Disability Services",
  "Education",
  "Employment",
  "Family Services",
  "Financial Support",
  "Food Assistance",
  "Health & Wellness",
  "Housing & Shelter",
  "Legal Aid",
  "Mental Health",
  "Recreation",
  "Seniors",
  "Transportation",
  "Veteran Services",
  "Volunteer Opportunities",
  "Youth Programs",
];
const TOAST_DURATION_MS = 4000;
const MAX_VOLUNTEER_URL_LENGTH = 50;

function formatDisplayDate(date) {
  if (!date) {
    return "";
  }

  return new Date(`${date}T00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDisplayTime(time) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":").map(Number);
  const displayDate = new Date(2000, 0, 1, hours, minutes);

  return displayDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isLikelyUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getMaxAdvanceDate() {
  const today = getTodayDate();
  return new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
}

function buildDateTime(date, time) {
  if (!date || !time) {
    return null;
  }

  return new Date(`${date}T${time}:00`);
}

function isDateTimeInPast(date, time) {
  const dateTime = buildDateTime(date, time);
  return dateTime ? dateTime < new Date() : false;
}

function isDateTimeBeyondMaxAdvance(date, time) {
  const dateTime = buildDateTime(date, time);
  if (!dateTime) {
    return false;
  }

  const maxAdvance = getMaxAdvanceDate();
  const maxAdvanceEnd = new Date(
    maxAdvance.getFullYear(),
    maxAdvance.getMonth(),
    maxAdvance.getDate(),
    23,
    59,
    59,
    999
  );

  return dateTime > maxAdvanceEnd;
}

const PostEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState(
    FALLBACK_CATEGORY_NAMES.map((name) => ({ id: "", name }))
  );
  const [tagOptions, setTagOptions] = useState([]);
  const [category, setCategory] = useState(FALLBACK_CATEGORY_NAMES[0]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  const [flyer, setFlyer] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error || !data?.length) {
        if (error) {
          console.error("Error fetching categories:", error);
        }
        return;
      }

      setCategories(data);
      setCategory((currentCategory) =>
        data.some((categoryOption) => categoryOption.name === currentCategory)
          ? currentCategory
          : data[0].name
      );
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name")
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Error fetching tags:", error);
        return;
      }

      setTagOptions(data || []);
      setSelectedTagIds((currentSelected) =>
        currentSelected.filter((tagId) => (data || []).some((tagOption) => tagOption.id === tagId))
      );
    };

    loadTags();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((categoryOption) => categoryOption.name === category) || null,
    [categories, category]
  );

  const selectedTags = useMemo(
    () => tagOptions.filter((tagOption) => selectedTagIds.includes(tagOption.id)),
    [tagOptions, selectedTagIds]
  );

  const trimmedLocation = location.trim();
  const isOnlineLocation = isLikelyUrl(trimmedLocation);
  const isVolunteerUrlTooLong = isOnlineLocation && trimmedLocation.length > MAX_VOLUNTEER_URL_LENGTH;
  const isVolunteerUrlInvalid =
    trimmedLocation !== "" &&
    trimmedLocation.includes("://") &&
    !isOnlineLocation;
  const locationError = isVolunteerUrlInvalid
    ? "Volunteer URL must be a valid http(s) address."
    : isVolunteerUrlTooLong
      ? "Volunteer URL must be 50 characters or less."
      : undefined;

  const minStartDate = formatDateInputValue(getTodayDate());
  const maxStartDate = formatDateInputValue(getMaxAdvanceDate());

  const isStepValid = () => {
    if (step === 1) {
      return (
        title.trim() !== "" &&
        description.trim() !== "" &&
        category.trim() !== ""
      );
    }

    if (step === 2) {
      const trimmedLocation = location.trim();
      const isOnlineEvent = isLikelyUrl(trimmedLocation);
      const isVolunteerUrlInvalid =
        trimmedLocation !== "" &&
        trimmedLocation.includes("://") &&
        !isOnlineEvent;

      const hasValidDates =
        date !== "" &&
        endDate !== "" &&
        endDate >= date &&
        !isDateTimeInPast(date, startTime) &&
        !isDateTimeBeyondMaxAdvance(date, startTime) &&
        !isDateTimeBeyondMaxAdvance(endDate, endTime);

      return (
        hasValidDates &&
        startTime !== "" &&
        endTime !== "" &&
        trimmedLocation !== "" &&
        !(isOnlineEvent && trimmedLocation.length > MAX_VOLUNTEER_URL_LENGTH) &&
        !isVolunteerUrlInvalid
      );
    }

    return true;
  };

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setCategory(categories[0]?.name || FALLBACK_CATEGORY_NAMES[0]);
    setSelectedTagIds([]);
    setDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setFlyer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setToast(null);

    if (step === 1) {
      if (!isStepValid()) {
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!isStepValid()) {
        setToast({
          message: "Please fix any errors before continuing.",
          type: "error",
        });
        return;
      }
      setStep(3);
      return;
    }

    if (endDate < date) {
      setToast({
        message: "End date must be on or after the start date.",
        type: "error",
      });
      return;
    }

    if (date === endDate && endTime <= startTime) {
      setToast({
        message: "End time must be after the start time for single-day events.",
        type: "error",
      });
      return;
    }

    if (isDateTimeInPast(date, startTime)) {
      setToast({
        message: "Event start cannot be in the past.",
        type: "error",
      });
      return;
    }

    if (isDateTimeBeyondMaxAdvance(date, startTime)) {
      setToast({
        message: "Event start must be within 3 months of today.",
        type: "error",
      });
      return;
    }

    if (isDateTimeBeyondMaxAdvance(endDate, endTime)) {
      setToast({
        message: "Event end must be within 3 months of today.",
        type: "error",
      });
      return;
    }

    const trimmedLocation = location.trim();
    const isOnlineEvent = isLikelyUrl(trimmedLocation);

    if (isOnlineEvent && trimmedLocation.length > MAX_VOLUNTEER_URL_LENGTH) {
      setToast({
        message: `Volunteer URL cannot exceed ${MAX_VOLUNTEER_URL_LENGTH} characters.`,
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("No logged in user", sessionError);
        setToast({
          message: "You must be logged in to post an event.",
          type: "error",
        });
        return;
      }

      const userId = session.user.id;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("organization_id")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching submitting user:", userError);
        setToast({
          message: "We couldn't verify your organization for this event.",
          type: "error",
        });
        return;
      }

      if (!userData?.organization_id) {
        setToast({
          message: "Your account must be linked to an organization before posting events.",
          type: "error",
        });
        return;
      }

      let categoryId = selectedCategory?.id || null;

      if (!categoryId) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", category)
          .maybeSingle();

        if (categoryError) {
          console.error("Error fetching category:", categoryError);
          setToast({
            message: "Invalid category.",
            type: "error",
          });
          return;
        }

        if (!categoryData) {
          console.error("Category not found:", category);
          setToast({
            message: `Category "${category}" does not exist.`,
            type: "error",
          });
          return;
        }

        categoryId = categoryData.id;
      }

      const selectedTagRecords = selectedTags
        .map((tagOption) => ({ event_id: null, tag_id: tagOption.id }))
        .filter((tagRow) => Boolean(tagRow.tag_id));

      const payload = {
        title: title.trim(),
        description: description.trim(),
        start_datetime: `${date}T${startTime}:00`,
        end_datetime: `${endDate}T${endTime}:00`,
        location: isOnlineEvent ? "Online" : trimmedLocation,
        volunteer_url: isOnlineEvent ? trimmedLocation : null,
        created_by: userId,
        category_id: categoryId,
        organization_id: userData.organization_id,
        status: "pending",
      };

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert([payload])
        .select("id")
        .single();

      if (eventError || !eventData?.id) {
        console.error("Insert error:", eventError);
        setToast({
          message: eventError?.message || "Failed to submit event.",
          type: "error",
        });
        return;
      }

      if (selectedTagRecords.length > 0) {
        const { error: eventTagsError } = await supabase.from("event_tags").insert(
          selectedTagRecords.map((tagRow) => ({
            event_id: eventData.id,
            tag_id: tagRow.tag_id,
          }))
        );

        if (eventTagsError) {
          console.error("Error saving event tags:", eventTagsError);
          await supabase.from("events").delete().eq("id", eventData.id);
          setToast({
            message: eventTagsError.message || "Failed to save event tags.",
            type: "error",
          });
          return;
        }
      }

      resetForm();
      navigate("/events", {
        state: {
          flashMessage: "Your event request was successfully sent and is now pending review.",
          flashType: "success",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="postevent-page">
      {toast ? (
        <div
          className={`postevent-toast postevent-toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <div className="postevent-toast-indicator" aria-hidden="true"></div>
          <p className="postevent-toast-message">{toast.message}</p>
        </div>
      ) : null}

      <main className="postevent-main">
        <h1 className="postevent-title">Post a Community Event</h1>
        <p className="postevent-subtitle">
          Share your event with the Palouse community in just a few simple steps
        </p>

        <div className="postevent-steps">
          <div className={`step ${step === 1 ? "current" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step === 2 ? "current" : ""}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${step === 3 ? "current" : ""}`}>3</div>
        </div>

        <div className={`postevent-card ${step === 3 ? "step-3" : ""}`}>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <h2 className="step-title">Step 1: Basic Information</h2>
                <p className="step-description">
                  Tell us about your event with a clear, descriptive title
                </p>

                <FormField htmlFor="event-title" label="Event Title" required>
                  <input
                    id="event-title"
                    className="form-input"
                    type="text"
                    placeholder="E.g., Community Garden Workshop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </FormField>

                <FormField htmlFor="category" label="Category" required>
                  <select
                    id="category"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((categoryOption) => (
                      <option key={categoryOption.id || categoryOption.name} value={categoryOption.name}>
                        {categoryOption.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <p className="postevent-help-text postevent-help-text-tight">
                    Select one or more tags for your event. Tags are optional.
                  </p>
                  <div className="category-list postevent-tag-list">
                    {tagOptions.length > 0 ? (
                      tagOptions.map((tagOption) => (
                        <button
                          key={tagOption.id}
                          type="button"
                          className={`category-pill ${selectedTagIds.includes(tagOption.id) ? "active" : ""}`}
                          onClick={() =>
                            setSelectedTagIds((currentSelected) =>
                              currentSelected.includes(tagOption.id)
                                ? currentSelected.filter((tagId) => tagId !== tagOption.id)
                                : [...currentSelected, tagOption.id]
                            )
                          }
                        >
                          {tagOption.name}
                        </button>
                      ))
                    ) : (
                      <p className="postevent-empty-tags">No tags are available yet.</p>
                    )}
                  </div>
                </div>

                <FormField htmlFor="description" label="Event Description" required>
                  <textarea
                    id="description"
                    className="form-input"
                    rows={8}
                    placeholder="Describe your event, what attendees will learn or experience, and any important details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </FormField>

                <p className="postevent-help-text">
                  Be clear and welcoming. Include accessibility information if relevant.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="step-title">Step 2: When & Where</h2>
                <p className="step-description">Help people find and attend your event</p>

                <FormField htmlFor="date" label="Start Date" required>
                  <input
                    id="date"
                    className="form-input"
                    type="date"
                    value={date}
                    min={minStartDate}
                    max={maxStartDate}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </FormField>

                <FormField htmlFor="end-date" label="End Date" required>
                  <input
                    id="end-date"
                    className="form-input"
                    type="date"
                    value={endDate}
                    min={date || minStartDate}
                    max={maxStartDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </FormField>

                <FormField htmlFor="start-time" label="Start Time" required>
                  <input
                    id="start-time"
                    className="form-input"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </FormField>

                <FormField htmlFor="end-time" label="End Time" required>
                  <input
                    id="end-time"
                    className="form-input"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </FormField>

                <FormField
                  htmlFor="location"
                  label="Location or Zoom Link"
                  error={locationError}
                  required
                >
                  <input
                    id="location"
                    className="form-input"
                    type="text"
                    placeholder="E.g., Example Community Center, 206 E 3rd St or https://example.com/..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </FormField>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="step-title">Step 3: Event Flyer (Optional)</h2>
                <p className="step-description">
                  Upload an eye-catching flyer to attract more attendees
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="flyer">
                    Upload Flyer Image
                  </label>
                  <div
                    className="file-upload"
                    onClick={() => document.getElementById("flyer").click()}
                  >
                    <img src={uploadIcon} alt="Upload" className="upload-icon" />
                    <input
                      id="flyer"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.gif"
                      style={{ display: "none" }}
                      onChange={(e) => setFlyer(e.target.files[0])}
                    />

                    <p className="upload-text">Click to upload or drag and drop</p>
                    <p className="upload-subtext">PDF, PNG, JPG, or GIF</p>

                    {flyer && <p className="upload-file-name">{flyer.name}</p>}
                  </div>
                </div>

                <div className="summary-card">
                  <h3 className="summary-title">Event Summary</h3>
                  <p>
                    <strong>Title:</strong> {title}
                  </p>
                  <p>
                    <strong>Category:</strong> {category}
                  </p>
                  {selectedTags.length > 0 && (
                    <p>
                      <strong>Tags:</strong>{" "}
                      {selectedTags.map((tagOption) => tagOption.name).join(", ")}
                    </p>
                  )}
                  <p>
                    <strong>Date:</strong>{" "}
                    {date === endDate
                      ? formatDisplayDate(date)
                      : `${formatDisplayDate(date)} - ${formatDisplayDate(endDate)}`}
                  </p>
                  <p>
                    <strong>Time:</strong> {formatDisplayTime(startTime)} - {formatDisplayTime(endTime)}
                  </p>
                  <p>
                    <strong>Location:</strong> {isLikelyUrl(location.trim()) ? "Online" : location}
                  </p>
                  {isLikelyUrl(location.trim()) && (
                    <p>
                      <strong>Zoom Link:</strong> {location}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="postevent-button-row">
              {step > 1 && (
                <button
                  type="button"
                  className="postevent-button secondary"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                className={`postevent-button ${step === 3 ? "submit" : ""}`}
                disabled={!isStepValid() || isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : step === 2
                    ? "Continue to Flyer Upload"
                    : step === 3
                      ? "Submit for Review"
                      : "Continue to Date & Location"}
              </button>
            </div>

            {step === 3 && (
              <p className="review-text">
                Your event will be reviewed by our team and published within 24 hours.
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostEvent;
