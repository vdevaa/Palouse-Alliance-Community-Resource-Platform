import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EventCalendar from "../components/EventCalendar";
import EventCard from "../components/EventCard";
import { supabase } from "../lib/supabase";
import "../styles/Home.css";

const ALL_EVENTS_CATEGORY = "All Events";

function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(date1, date2) {
  return getDateKey(date1) === getDateKey(date2);
}

function isDateWithinEvent(date, startDate, endDate) {
  const currentDay = getStartOfDay(date);
  const eventStartDay = getStartOfDay(startDate);
  const eventEndDay = getStartOfDay(endDate);
  return currentDay >= eventStartDay && currentDay <= eventEndDay;
}

function getEventDateKeys(startDate, endDate) {
  const keys = [];
  const rangeStart = getStartOfDay(startDate);
  const rangeEnd = getStartOfDay(endDate);

  for (
    let currentDate = rangeStart;
    currentDate <= rangeEnd;
    currentDate = addDays(currentDate, 1)
  ) {
    keys.push(getDateKey(currentDate));
  }

  return keys;
}

function formatFullDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(start, end) {
  const timeFormat = { hour: "numeric", minute: "2-digit" };

  if (!isSameDay(start, end)) {
    return `${formatFullDate(start)} ${start.toLocaleTimeString(
      "en-US",
      timeFormat
    )} - ${formatFullDate(end)} ${end.toLocaleTimeString("en-US", timeFormat)}`;
  }

  return `${start.toLocaleTimeString("en-US", timeFormat)} - ${end.toLocaleTimeString(
    "en-US",
    timeFormat
  )}`;
}

function formatCompactDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getMonthMatrix(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function parseSupabaseDateTime(timestamp) {
  if (!timestamp) {
    return null;
  }

  const match = timestamp.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/
  );

  if (!match) {
    return new Date(timestamp);
  }

  const [, year, month, day, hours, minutes, seconds = "0"] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  );
}

function normalizeSupabaseEvent(event) {
  const startDate = parseSupabaseDateTime(event.start_datetime);
  const endDate = parseSupabaseDateTime(event.end_datetime);

  return {
    ...event,
    description: event.description || "",
    location: event.location || "",
    startDate,
    endDate,
    organizationName: event.organizations?.name || "Unknown Organization",
    categoryName: event.categories?.name || "General",
  };
}

const Home = ({ session }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([ALL_EVENTS_CATEGORY]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [myEvents, setMyEvents] = useState([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [myEventsError, setMyEventsError] = useState("");
  const [myEventsSections, setMyEventsSections] = useState({
    pending: true,
    approved: true,
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(ALL_EVENTS_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCalendarData = async () => {
      setEventsLoading(true);
      setEventsError("");

      const [{ data: eventRows, error: eventsQueryError }, { data: categoryRows, error: categoriesQueryError }] =
        await Promise.all([
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
                organizations ( name ),
                categories ( name )
              `
            )
            .eq("status", "approved")
            .order("start_datetime", { ascending: true }),
          supabase.from("categories").select("name").order("name", { ascending: true }),
        ]);

      if (!isMounted) {
        return;
      }

      if (eventsQueryError || categoriesQueryError) {
        console.error("Error fetching home page calendar data:", {
          eventsQueryError,
          categoriesQueryError,
        });
        setEvents([]);
        setCategories([ALL_EVENTS_CATEGORY]);
        setEventsError("Unable to load events from Supabase right now.");
        setEventsLoading(false);
        return;
      }

      const normalizedEvents = (eventRows || [])
        .map(normalizeSupabaseEvent)
        .sort((first, second) => first.startDate - second.startDate);

      const fetchedCategoryNames = (categoryRows || []).map((category) => category.name);

      setEvents(normalizedEvents);
      setCategories([ALL_EVENTS_CATEGORY, ...fetchedCategoryNames]);

      if (normalizedEvents.length > 0) {
        const firstEventDate = normalizedEvents[0].startDate;
        setSelectedDate((currentSelectedDate) => currentSelectedDate || firstEventDate);
        setVisibleMonth((currentVisibleMonth) => {
          const isCurrentMonthEmpty = normalizedEvents.every(
            (event) =>
              event.startDate.getMonth() !== currentVisibleMonth.getMonth() ||
              event.startDate.getFullYear() !== currentVisibleMonth.getFullYear()
          );

          if (!isCurrentMonthEmpty) {
            return currentVisibleMonth;
          }

          return new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1);
        });
      }

      setEventsLoading(false);
    };

    fetchCalendarData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMyEvents = async () => {
      if (!session?.user?.id) {
        setMyEvents([]);
        setMyEventsError("");
        setMyEventsLoading(false);
        return;
      }

      setMyEventsLoading(true);
      setMyEventsError("");

      const { data, error } = await supabase
        .from("events")
        .select(
          `
            id,
            title,
            start_datetime,
            end_datetime,
            status,
            created_by,
            organizations ( name )
          `
        )
        .eq("created_by", session.user.id)
        .order("start_datetime", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Error fetching user events:", error);
        setMyEvents([]);
        setMyEventsError("We couldn't load your submitted events right now.");
        setMyEventsLoading(false);
        return;
      }

      setMyEvents((data || []).map(normalizeSupabaseEvent));
      setMyEventsLoading(false);
    };

    fetchMyEvents();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const calendarDays = useMemo(
    () => getMonthMatrix(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth]
  );

  const eventCountByDate = useMemo(() => {
    return events.reduce((counts, event) => {
      getEventDateKeys(event.startDate, event.endDate).forEach((key) => {
        counts[key] = (counts[key] || 0) + 1;
      });
      return counts;
    }, {});
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSelectedDate = selectedDate
        ? isDateWithinEvent(selectedDate, event.startDate, event.endDate)
        : true;
      const matchesCategory =
        selectedCategory === ALL_EVENTS_CATEGORY || event.categoryName === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.organizationName.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      return matchesSelectedDate && matchesCategory && matchesSearch;
    });
  }, [events, searchQuery, selectedCategory, selectedDate]);

  const myEventCounts = useMemo(() => {
    return myEvents.reduce(
      (counts, event) => {
        const statusKey = event.status?.toLowerCase() || "other";

        if (statusKey === "approved") {
          counts.approved += 1;
        } else if (statusKey === "pending") {
          counts.pending += 1;
        } else {
          counts.other += 1;
        }

        return counts;
      },
      { approved: 0, pending: 0, other: 0 }
    );
  }, [myEvents]);

  const pendingMyEvents = useMemo(
    () => myEvents.filter((event) => (event.status || "").toLowerCase() === "pending"),
    [myEvents]
  );

  const approvedMyEvents = useMemo(
    () => myEvents.filter((event) => (event.status || "").toLowerCase() === "approved"),
    [myEvents]
  );

  const otherMyEvents = useMemo(
    () =>
      myEvents.filter((event) => {
        const statusKey = (event.status || "").toLowerCase();
        return statusKey !== "pending" && statusKey !== "approved";
      }),
    [myEvents]
  );

  function getStatusLabel(status) {
    if (!status) {
      return "In Review";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDateCount = selectedDate ? eventCountByDate[getDateKey(selectedDate)] || 0 : events.length;

  function handleMonthChange(offset) {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
  }

  function handleSelectDay(day) {
    setSelectedDate(day);
    setVisibleMonth(new Date(day.getFullYear(), day.getMonth(), 1));
  }

  function resetDateFilter() {
    setSelectedDate(null);
  }

  function toggleMyEventsSection(sectionName) {
    setMyEventsSections((currentSections) => ({
      ...currentSections,
      [sectionName]: !currentSections[sectionName],
    }));
  }

  return (
    <div className="home-page">
      

      <main className="home-main">
        <section className="home-hero">
          <h1>Discover Community Events</h1>
          <p>
            Connect with local organizations and find meaningful events across
            the Palouse region.
          </p>
        </section>

        <section className="home-search-section">
          <input
            type="text"
            className="home-search-input"
            placeholder="Search events by title, organization, location, or keyword..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </section>

        <section
          className={`home-content-grid ${
            session ? "home-content-grid-authenticated" : "home-content-grid-public"
          }`}
        >
          <aside className="home-left-column">
            <div className="home-panel">
              <div className="panel-header">
                <h2>Event Calendar</h2>
              </div>

              <EventCalendar
                calendarDays={calendarDays}
                eventCountByDate={eventCountByDate}
                formatFullDate={formatFullDate}
                getDateKey={getDateKey}
                handleMonthChange={handleMonthChange}
                handleSelectDay={handleSelectDay}
                isSameDay={isSameDay}
                monthLabel={monthLabel}
                resetDateFilter={resetDateFilter}
                selectedDate={selectedDate}
                selectedDateCount={selectedDateCount}
                visibleMonth={visibleMonth}
              />
            </div>

            <div className="home-panel">
              <div className="panel-header">
                <h2>Categories</h2>
              </div>

              <div className="category-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`category-pill ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="home-events-section">
            <div className="events-header">
              <div>
                <h2>
                  {filteredEvents.length}{" "}
                  {filteredEvents.length === 1 ? "Event" : "Events"} Found
                </h2>
                <p className="events-subtitle">
                  {eventsLoading
                    ? "Loading approved events from Supabase..."
                    : eventsError }
                </p>
              </div>
            </div>

            {!eventsLoading && filteredEvents.length === 0 ? (
              <div className="empty-state">
                <h3>No Events Found</h3>
                <p>
                  Try selecting a different date or category, or adjusting your
                  search.
                </p>
              </div>
            ) : eventsLoading ? (
              <div className="empty-state">
                <h3>Loading Events</h3>
                <p>Fetching calendar events from Supabase.</p>
              </div>
            ) : (
              <div className={`event-grid ${session ? "event-grid-authenticated" : "event-grid-public"}`}>
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    formatFullDate={formatFullDate}
                    formatTimeRange={formatTimeRange}
                  />
                ))}
              </div>
            )}
          </section>

          {session ? (
            <aside className="home-right-column">
              <div className="home-panel home-my-events-panel">
                <div className="panel-header">
                  <h2>My Events</h2>
                  <p className="panel-description">
                    Track where your community submissions stand.
                  </p>
                </div>

                <div className="my-events-summary">
                  <div className="my-events-stat">
                    <span className="my-events-stat-label">Pending</span>
                    <strong>{myEventCounts.pending}</strong>
                  </div>
                  <div className="my-events-stat">
                    <span className="my-events-stat-label">Approved</span>
                    <strong>{myEventCounts.approved}</strong>
                  </div>
                </div>

                {myEventsLoading ? (
                  <div className="my-events-empty-state">
                    <h3>Loading Your Events</h3>
                    <p>Checking the status of your recent submissions.</p>
                  </div>
                ) : myEventsError ? (
                  <div className="my-events-empty-state">
                    <h3>Unable to Load</h3>
                    <p>{myEventsError}</p>
                  </div>
                ) : myEvents.length === 0 ? (
                  <div className="my-events-empty-state">
                    <h3>No Submitted Events Yet</h3>
                    <p>
                      When you submit an event for review, it will appear here with its
                      approval status.
                    </p>
                    <Link className="my-events-cta" to="/post-event">
                      Post an Event
                    </Link>
                  </div>
                ) : (
                  <div className="my-events-list">
                    <section className="my-events-group">
                      <button
                        className="my-events-group-toggle"
                        onClick={() => toggleMyEventsSection("pending")}
                        type="button"
                      >
                        <span className="my-events-group-title">Pending Events</span>
                        <span className="my-events-group-meta">
                          {pendingMyEvents.length}
                          <span className="my-events-group-chevron">
                            {myEventsSections.pending ? "−" : "+"}
                          </span>
                        </span>
                      </button>

                      {myEventsSections.pending ? (
                        pendingMyEvents.length > 0 ? (
                          <div className="my-events-group-list">
                            {pendingMyEvents.map((event) => (
                              <article className="my-event-card" key={event.id}>
                                <div className="my-event-card-top">
                                  <span className="my-event-status my-event-status-pending">
                                    {getStatusLabel(event.status)}
                                  </span>
                                  <span className="my-event-date">
                                    {formatCompactDate(event.startDate)}
                                  </span>
                                </div>
                                <h3>{event.title}</h3>
                                <p className="my-event-org">{event.organizationName}</p>
                                <p className="my-event-time">
                                  {formatTimeRange(event.startDate, event.endDate)}
                                </p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="my-events-group-empty">
                            No pending events right now.
                          </p>
                        )
                      ) : null}
                    </section>

                    <section className="my-events-group">
                      <button
                        className="my-events-group-toggle"
                        onClick={() => toggleMyEventsSection("approved")}
                        type="button"
                      >
                        <span className="my-events-group-title">Approved Events</span>
                        <span className="my-events-group-meta">
                          {approvedMyEvents.length + otherMyEvents.length}
                          <span className="my-events-group-chevron">
                            {myEventsSections.approved ? "−" : "+"}
                          </span>
                        </span>
                      </button>

                      {myEventsSections.approved ? (
                        approvedMyEvents.length > 0 || otherMyEvents.length > 0 ? (
                          <div className="my-events-group-list">
                            {[...approvedMyEvents, ...otherMyEvents].map((event) => (
                              <article className="my-event-card" key={event.id}>
                                <div className="my-event-card-top">
                                  <span
                                    className={`my-event-status my-event-status-${(
                                      event.status || "approved"
                                    ).toLowerCase()}`}
                                  >
                                    {getStatusLabel(event.status)}
                                  </span>
                                  <span className="my-event-date">
                                    {formatCompactDate(event.startDate)}
                                  </span>
                                </div>
                                <h3>{event.title}</h3>
                                <p className="my-event-org">{event.organizationName}</p>
                                <p className="my-event-time">
                                  {formatTimeRange(event.startDate, event.endDate)}
                                </p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="my-events-group-empty">
                            No approved events yet.
                          </p>
                        )
                      ) : null}
                    </section>
                  </div>
                )}
              </div>
            </aside>
          ) : null}
        </section>
      </main>

    </div>
  );
};

export default Home;
