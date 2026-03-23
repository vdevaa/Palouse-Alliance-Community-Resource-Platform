import React from "react";
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
  return (
    <article className="event-card">
      <div className="event-card-top">
        <span className="event-category">{event.categoryName}</span>
        <span className="event-status">{event.status}</span>
      </div>

      <h3>{event.title}</h3>
      <p className="event-org">{event.organizationName}</p>
      <p className="event-description">{event.description}</p>

      <div className="event-meta">
        <p>
          <strong>Date:</strong> {formatEventDateLabel(
            event.startDate,
            event.endDate,
            formatFullDate
          )}
        </p>
        <p>
          <strong>Time:</strong> {formatTimeRange(event.startDate, event.endDate)}
        </p>
        <p>
          <strong>Location:</strong> {event.location}
        </p>
      </div>

      <div className="event-actions">
        <button className="primary-btn" type="button">
          View Details
        </button>
      </div>
    </article>
  );
}

export default EventCard;
