import React, { useEffect, useMemo, useState } from "react";

import uploadIcon from "../assets/upload-icon.png";
import { supabase } from "../lib/supabase";
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

const PostEvent = () => {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState(
    FALLBACK_CATEGORY_NAMES.map((name) => ({ id: "", name }))
  );
  const [category, setCategory] = useState(FALLBACK_CATEGORY_NAMES[0]);

  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  const [flyer, setFlyer] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const selectedCategory = useMemo(
    () => categories.find((categoryOption) => categoryOption.name === category) || null,
    [categories, category]
  );

  const isStepValid = () => {
    if (step === 1) {
      return (
        title.trim() !== "" &&
        description.trim() !== "" &&
        category.trim() !== ""
      );
    }

    if (step === 2) {
      return (
        date !== "" &&
        endDate !== "" &&
        endDate >= date &&
        startTime !== "" &&
        endTime !== "" &&
        location.trim() !== ""
      );
    }

    return true;
  };

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setCategory(categories[0]?.name || FALLBACK_CATEGORY_NAMES[0]);
    setDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setFlyer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (endDate < date) {
      setErrorMessage("End date must be on or after the start date.");
      return;
    }

    if (date === endDate && endTime <= startTime) {
      setErrorMessage("End time must be after the start time for single-day events.");
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
        setErrorMessage("You must be logged in to post an event.");
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
        setErrorMessage("We couldn't verify your organization for this event.");
        return;
      }

      if (!userData?.organization_id) {
        setErrorMessage("Your account must be linked to an organization before posting events.");
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
          setErrorMessage("Invalid category.");
          return;
        }

        if (!categoryData) {
          console.error("Category not found:", category);
          setErrorMessage(`Category "${category}" does not exist.`);
          return;
        }

        categoryId = categoryData.id;
      }

      const trimmedLocation = location.trim();
      const isOnlineEvent = isLikelyUrl(trimmedLocation);
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

      const { error } = await supabase.from("events").insert([payload]);

      if (error) {
        console.error("Insert error:", error);
        setErrorMessage(error.message || "Failed to submit event.");
        return;
      }

      setSuccessMessage("Your event request was submitted for review.");
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="postevent-page">
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

                <div className="form-group">
                  <label className="form-label" htmlFor="event-title">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    className="form-input"
                    type="text"
                    placeholder="E.g., Community Garden Workshop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category
                  </label>
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
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Event Description
                  </label>
                  <textarea
                    id="description"
                    className="form-input"
                    rows={8}
                    placeholder="Describe your event, what attendees will learn or experience, and any important details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <p className="postevent-help-text">
                  Be clear and welcoming. Include accessibility information if relevant.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="step-title">Step 2: When & Where</h2>
                <p className="step-description">Help people find and attend your event</p>

                <div className="form-group">
                  <label className="form-label" htmlFor="date">
                    Start Date
                  </label>
                  <input
                    id="date"
                    className="form-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="end-date">
                    End Date
                  </label>
                  <input
                    id="end-date"
                    className="form-input"
                    type="date"
                    value={endDate}
                    min={date || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="start-time">
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    className="form-input"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="end-time">
                    End Time
                  </label>
                  <input
                    id="end-time"
                    className="form-input"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location or Zoom Link
                  </label>
                  <input
                    id="location"
                    className="form-input"
                    type="text"
                    placeholder="E.g., Moscow Community Center, 206 E 3rd St or https://zoom.us/j/..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
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

            {errorMessage && (
              <p className="review-text" role="alert">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="review-text" role="status">
                {successMessage}
              </p>
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
