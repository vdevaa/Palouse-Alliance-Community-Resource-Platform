import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import uploadIcon from "../assets/upload-icon.png";
import "../styles/PostEvent.css";

const PostEvent = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // step 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Education");

  const categories = [
    "Education",
    "Community Service",
    "Arts & Culture",
    "Health & Wellness",
    "Technology",
    "Environment",
    "Youth & Family",
  ];

  // step 2
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  // step 3
  const [flyer, setFlyer] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isStepValid = () => {
    if (step === 1) return title.trim() !== "" && description.trim() !== "";
    if (step === 2) return date !== "" && time.trim() !== "" && location.trim() !== "";
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) return setStep(2);
    if (step === 2) return setStep(3); 
    
    console.log({
      title,
      category,
      description,
      date,
      time,
      location,
      flyer,
    });
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
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
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
                    Event Date
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
                  <label className="form-label" htmlFor="time">
                    Event Time
                  </label>
                  <input
                    id="time"
                    className="form-input"
                    type="text"
                    placeholder="E.g., 10:00 AM - 12:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    className="form-input"
                    type="text"
                    placeholder="E.g., Moscow Community Center, 206 E 3rd St"
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
                    {date &&
                      new Date(date + "T00:00").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </p>
                  <p>
                    <strong>Time:</strong> {time}
                  </p>
                  <p>
                    <strong>Location:</strong> {location}
                  </p>
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
                disabled={!isStepValid()}
              >
                {step === 2
                  ? "Continue to Flyer Upload"
                  : step === 3
                    ? "Submit for Review"
                    : "Continue to Date & Location"}
              </button>
            </div>

            {errorMessage && (
              <p className="postevent-error-message" role="alert">
                {errorMessage}
              </p>
            )}

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