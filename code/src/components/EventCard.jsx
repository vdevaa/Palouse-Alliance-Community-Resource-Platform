import React, { useState } from "react";
import Popup from "./Popup";
import "../styles/EventCard.css";

function isSameCalendarDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatEventDateLabel(startDate, endDate, formatFullDate) {
  if (
    !(startDate instanceof Date) ||
    Number.isNaN(startDate.getTime()) ||
    !(endDate instanceof Date) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "Date unavailable";
  }

  if (isSameCalendarDay(startDate, endDate)) {
    return formatFullDate(startDate);
  }

  return `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
}

function EventCard({ event, formatFullDate, formatTimeRange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasLocation = Boolean(event.location?.trim());
  const volunteerUrl = event.volunteer_url?.trim();
  const volunteerActionLabel = volunteerUrl ? "Event Link" : "";
  const volunteerPopupDescription = "You are about to leave the site to visit this event's volunteer page.";
  const volunteerContinueLabel = "Continue";
  const tags = Array.isArray(event.tags) ? event.tags : [];
  const hasValidDates =
    event.startDate instanceof Date &&
    !Number.isNaN(event.startDate.getTime()) &&
    event.endDate instanceof Date &&
    !Number.isNaN(event.endDate.getTime());

  const handleViewDetails = () => {
    setConfirmOpen(true);
  };

  const handleLeaveSite = () => {
    if (!volunteerUrl) {
      return;
    }

    window.open(volunteerUrl, "_blank", "noopener,noreferrer");
    setConfirmOpen(false);
  };

  return (
    <>
      <article className="event-card">
        <div className="event-card-top">
          <span className="event-category">{event.categoryName}</span>
          {/* <span className="event-status">{event.status}</span> */}
        </div>

        <h3>{event.title}</h3>
        <p className="event-org">{event.organizationName}</p>
        <p className="event-description">{event.description}</p>

        <div className="event-meta">
          <p>
            <strong>Date:</strong>{" "}
            {hasValidDates
              ? formatEventDateLabel(event.startDate, event.endDate, formatFullDate)
              : "Date unavailable"}
          </p>
          <p>
            <strong>Time:</strong> {hasValidDates ? formatTimeRange(event.startDate, event.endDate) : "Time unavailable"}
          </p>
          {hasLocation ? (
            <p>
              <strong>Location:</strong> {event.location.trim()}
            </p>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div className="event-tag-list" aria-label="Event tags">
            {tags.map((tag) => (
              <span key={tag} className="event-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="event-actions">
          {volunteerUrl ? (
            <button className="primary-btn" type="button" onClick={handleViewDetails}>
              {volunteerActionLabel}
            </button>
          ) : null}
        </div>
      </article>

      {confirmOpen ? (
        <Popup
          title="Leave site?"
          description={volunteerPopupDescription}
          onClose={() => setConfirmOpen(false)}
          className="dialog-popup"
          actions={
            <>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={handleLeaveSite}>
                {volunteerContinueLabel}
              </button>
            </>
          }
          ariaLabel="Leave site confirmation"
        >
          <p className="event-redirect-url">{volunteerUrl}</p>
        </Popup>
      ) : null}
    </>
  );
}

export default EventCard;