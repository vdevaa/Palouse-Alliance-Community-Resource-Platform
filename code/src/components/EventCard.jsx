import React, { useState } from "react";
import "../styles/EventCard.css";

function isSameCalendarDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatEventDateLabel(startDate, endDate, formatFullDate) {
  if (isSameCalendarDay(startDate, endDate)) {
    return formatFullDate(startDate);
  }

  return `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
}

function EventCard({ event, formatFullDate, formatTimeRange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasLocation = Boolean(event.location?.trim());
  const volunteerUrl = event.volunteer_url?.trim();
  const tags = Array.isArray(event.tags) ? event.tags : [];

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

        {tags.length > 0 ? (
          <div className="event-tag-list" aria-label="Event tags">
            {tags.map((tag) => (
              <span key={tag} className="event-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <h3>{event.title}</h3>
        <p className="event-org">{event.organizationName}</p>
        <p className="event-description">{event.description}</p>

        <div className="event-meta">
          <p>
            <strong>Date:</strong>{" "}
            {formatEventDateLabel(event.startDate, event.endDate, formatFullDate)}
          </p>
          <p>
            <strong>Time:</strong> {formatTimeRange(event.startDate, event.endDate)}
          </p>
          {hasLocation ? (
            <p>
              <strong>Location:</strong> {event.location.trim()}
            </p>
          ) : null}
        </div>

        <div className="event-actions">
          {volunteerUrl ? (
            <button className="primary-btn" type="button" onClick={handleViewDetails}>
              View Details
            </button>
          ) : null}
        </div>
      </article>

      {confirmOpen ? (
        <div
          className="event-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Leave site confirmation"
          onClick={() => setConfirmOpen(false)}
        >
          <div className="event-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="event-modal-header">
              <h3>Leave site?</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setConfirmOpen(false)}
                aria-label="Close confirmation"
              >
                ×
              </button>
            </div>
            <p className="event-redirect-message">
              You are about to leave the site to visit this event's volunteer page.
            </p>
            <p className="event-redirect-url">{volunteerUrl}</p>
            <div className="event-actions event-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setConfirmOpen(false)}
              >
                Go back
              </button>
              <button type="button" className="primary-btn" onClick={handleLeaveSite}>
                Leave site
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default EventCard;