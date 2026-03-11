import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCalendar from "../components/EventCalendar";
import EventCard from "../components/EventCard";
import "../styles/Home.css";

const mockOrganizations = [
  {
    id: "org-palouse-health",
    name: "Palouse Health Network",
    description: "Regional nonprofit focused on access to preventive care.",
    phone_number: "(509) 555-0101",
    email: "hello@palousehealth.org",
    location: "Moscow, ID",
  },
  {
    id: "org-learning-hub",
    name: "Palouse Learning Hub",
    description: "Community education partner for youth and families.",
    phone_number: "(509) 555-0102",
    email: "team@learninghub.org",
    location: "Pullman, WA",
  },
  {
    id: "org-green-palouse",
    name: "Green Palouse",
    description: "Volunteer-led environmental and beautification group.",
    phone_number: "(509) 555-0103",
    email: "volunteer@greenpalouse.org",
    location: "Moscow, ID",
  },
  {
    id: "org-arts-council",
    name: "Palouse Arts Council",
    description: "Arts programming and family creative events.",
    phone_number: "(509) 555-0104",
    email: "programs@palousearts.org",
    location: "Moscow, ID",
  },
];

const mockCategories = [
  { id: "cat-all", name: "All Events" },
  { id: "cat-education", name: "Education" },
  { id: "cat-community-service", name: "Community Service" },
  { id: "cat-arts-culture", name: "Arts & Culture" },
  { id: "cat-health-wellness", name: "Health & Wellness" },
  { id: "cat-technology", name: "Technology" },
  { id: "cat-environment", name: "Environment" },
  { id: "cat-youth-family", name: "Youth & Family" },
];

const mockEvents = [
  {
    id: "evt-health-fair",
    title: "Community Health Fair",
    description: "Join local organizations for free screenings, resource booths, and family wellness sessions.",
    start_datetime: "2026-02-06T10:00:00",
    end_datetime: "2026-02-06T13:00:00",
    location: "Moscow Community Center",
    volunteer_url: "https://example.org/health-fair",
    created_by: "usr-001",
    status: "published",
    organization_id: "org-palouse-health",
    category_id: "cat-health-wellness",
  },
  {
    id: "evt-stem-workshop",
    title: "Youth STEM Workshop",
    description: "Hands-on robotics and science activities for students and families.",
    start_datetime: "2026-02-06T13:00:00",
    end_datetime: "2026-02-06T15:30:00",
    location: "Pullman Public Library",
    volunteer_url: "https://example.org/stem-workshop",
    created_by: "usr-002",
    status: "published",
    organization_id: "org-learning-hub",
    category_id: "cat-education",
  },
  {
    id: "evt-cleanup-day",
    title: "Neighborhood Cleanup Day",
    description: "Volunteer with neighbors to clean trails, sort supplies, and beautify public spaces.",
    start_datetime: "2026-02-12T09:00:00",
    end_datetime: "2026-02-12T12:00:00",
    location: "Lawson Gardens",
    volunteer_url: "https://example.org/cleanup-day",
    created_by: "usr-003",
    status: "published",
    organization_id: "org-green-palouse",
    category_id: "cat-community-service",
  },
  {
    id: "evt-arts-night",
    title: "Family Arts Night",
    description: "Interactive art stations, live demos, and collaborative projects for all ages.",
    start_datetime: "2026-02-18T17:30:00",
    end_datetime: "2026-02-18T20:00:00",
    location: "Moscow Arts Center",
    volunteer_url: "https://example.org/arts-night",
    created_by: "usr-004",
    status: "published",
    organization_id: "org-arts-council",
    category_id: "cat-arts-culture",
  },
  {
    id: "evt-green-tech",
    title: "Green Tech Demo Night",
    description: "See student-built sustainability projects and connect with local mentors.",
    start_datetime: "2026-02-24T18:00:00",
    end_datetime: "2026-02-24T20:00:00",
    location: "WSU Innovation Lab",
    volunteer_url: "https://example.org/green-tech",
    created_by: "usr-002",
    status: "published",
    organization_id: "org-learning-hub",
    category_id: "cat-technology",
  },
  {
    id: "evt-family-garden",
    title: "Family Garden Prep Day",
    description: "Prepare raised beds, learn spring planting basics, and help seed the community garden.",
    start_datetime: "2026-02-28T11:00:00",
    end_datetime: "2026-02-28T14:00:00",
    location: "Pullman Community Garden",
    volunteer_url: "https://example.org/garden-prep",
    created_by: "usr-003",
    status: "published",
    organization_id: "org-green-palouse",
    category_id: "cat-youth-family",
  },
];

const categories = mockCategories.map((category) => category.name);

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function isSameDay(date1, date2) {
  return getDateKey(date1) === getDateKey(date2);
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

  return `${start.toLocaleTimeString("en-US", timeFormat)} - ${end.toLocaleTimeString(
    "en-US",
    timeFormat
  )}`;
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

const Home = () => {
  const initialSelectedDate = new Date("2026-02-06T10:00:00");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth(), 1)
  );

  const organizationsById = useMemo(
    () =>
      Object.fromEntries(
        mockOrganizations.map((organization) => [organization.id, organization])
      ),
    []
  );

  const categoriesById = useMemo(
    () =>
      Object.fromEntries(mockCategories.map((category) => [category.id, category])),
    []
  );

  const events = useMemo(
    () =>
      mockEvents
        .map((event) => {
          const startDate = new Date(event.start_datetime);
          const endDate = new Date(event.end_datetime);
          const organization = organizationsById[event.organization_id];
          const category = categoriesById[event.category_id];

          return {
            ...event,
            startDate,
            endDate,
            organizationName: organization?.name || "Unknown Organization",
            categoryName: category?.name || "General",
          };
        })
        .sort((first, second) => first.startDate - second.startDate),
    [categoriesById, organizationsById]
  );

  const calendarDays = useMemo(
    () => getMonthMatrix(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth]
  );

  const eventCountByDate = useMemo(() => {
    return events.reduce((counts, event) => {
      const key = getDateKey(event.startDate);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSelectedDate = selectedDate ? isSameDay(event.startDate, selectedDate) : true;
      const matchesCategory =
        selectedCategory === "All Events" || event.categoryName === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.organizationName.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      return matchesSelectedDate && matchesCategory && matchesSearch;
    });
  }, [events, searchQuery, selectedCategory, selectedDate]);

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

  return (
    <div className="home-page">
      <Navbar />

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

        <section className="home-content-grid">
          <aside className="home-sidebar">
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
                  Mocked against Supabase structure: `events`, `organizations`,
                  and `categories`.
                </p>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <h3>No Events Found</h3>
                <p>
                  Try selecting a different date or category, or adjusting your
                  search.
                </p>
              </div>
            ) : (
              <div className="event-grid">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
