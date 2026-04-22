import React, { useState } from "react";
import Popup from "./Popup";
import {
  formatEventDateLabel,
  formatEventTimeRange,
  isSameCalendarDay,
} from "../lib/dateTime";
import "../styles/EventCard.css";

function EventCard({ event, footerActions = null, formatFullDate, formatTimeRange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasLocation = Boolean(event.location?.trim());
  const volunteerUrl = event.volunteer_url?.trim();
  const volunteerActionLabel = volunteerUrl ? "Event Link" : "";
  const volunteerPopupDescription = "You are about to leave the site to visit this event's volunteer page.";
  const volunteerContinueLabel = "Continue";
  const tags = Array.isArray(event.tags) ? event.tags : [];
  const organizationName = event.organizationName?.trim();
  const categoryName = event.categoryName?.trim();
  const hasValidDates =
    event.startDate instanceof Date &&
    !Number.isNaN(event.startDate.getTime()) &&
    event.endDate instanceof Date &&
    !Number.isNaN(event.endDate.getTime());

  const renderDateLabel = () => {
    if (!hasValidDates) {
      return "Date unavailable";
    }

    if (typeof formatFullDate === "function") {
      if (isSameCalendarDay(event.startDate, event.endDate)) {
        return formatFullDate(event.startDate);
      }
      return `${formatFullDate(event.startDate)} - ${formatFullDate(event.endDate)}`;
    }

    return formatEventDateLabel(event.startDate, event.endDate);
  };

  const renderTimeValue = () => {
    if (!hasValidDates) {
      return "Time unavailable";
    }

    if (typeof formatTimeRange === "function") {
      return formatTimeRange(event.startDate, event.endDate);
    }

    return formatEventTimeRange(event.startDate, event.endDate);
  };

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
        <h3>{event.title}</h3>
        {(organizationName || categoryName) ? (
          <p className="event-org">
            {organizationName ? <span>{organizationName}</span> : null}
            {organizationName && categoryName ? <span> · </span> : null}
            {categoryName ? <span>{categoryName}</span> : null}
          </p>
        ) : null}
        <p className="event-description">{event.description}</p>

        <div className="event-meta">
          <p>
            <strong>Date:</strong>{" "}
            {hasValidDates ? renderDateLabel() : "Date unavailable"}
          </p>
          <p>
            <strong>Time:</strong> {hasValidDates ? renderTimeValue() : "Time unavailable"}
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

        {footerActions ? <div className="event-footer-actions">{footerActions}</div> : null}
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