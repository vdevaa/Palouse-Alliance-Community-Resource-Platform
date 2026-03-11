import React from "react";
import "../styles/EventCalendar.css";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function EventCalendar({
  calendarDays,
  eventCountByDate,
  getDateKey,
  handleMonthChange,
  handleSelectDay,
  isSameDay,
  monthLabel,
  resetDateFilter,
  selectedDate,
  selectedDateCount,
  formatFullDate,
  visibleMonth,
}) {
  return (
    <div className="calendar-card">
      <div className="calendar-month-header">
        <button
          className="calendar-arrow"
          type="button"
          onClick={() => handleMonthChange(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span>{monthLabel}</span>
        <button
          className="calendar-arrow"
          type="button"
          onClick={() => handleMonthChange(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day) => {
          const dayKey = getDateKey(day);
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const eventCount = eventCountByDate[dayKey] || 0;

          return (
            <button
              key={dayKey}
              type="button"
              className={`calendar-day ${isSelected ? "selected" : ""} ${
                eventCount > 0 ? "has-event" : ""
              } ${!isCurrentMonth ? "outside-month" : ""}`}
              onClick={() => handleSelectDay(day)}
            >
              <span className="calendar-day-number">{day.getDate()}</span>
              {eventCount > 0 && <span className="event-dot"></span>}
            </button>
          );
        })}
      </div>

      <div className="selected-date-box">
        <p>{selectedDate ? "Showing events for" : "Showing all upcoming events"}</p>
        <strong>{selectedDate ? formatFullDate(selectedDate) : monthLabel}</strong>
        <span className="selected-date-meta">
          {selectedDateCount} {selectedDateCount === 1 ? "event" : "events"}
        </span>
        {selectedDate && (
          <button className="view-all-btn" type="button" onClick={resetDateFilter}>
            View All Dates
          </button>
        )}
      </div>
    </div>
  );
}

export default EventCalendar;
