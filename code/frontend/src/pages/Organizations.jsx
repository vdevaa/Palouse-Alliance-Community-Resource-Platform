import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select(`
          id,
          name,
          description,
          phone_number,
          email,
          location,
          events (id)
        `)
        .order("name", { ascending: true });

      if (error) {
        console.error(error.message);
      } else {
        const validOrgs = data.filter(
          (org) => org.name && org.name.trim() !== ""
        );
        const formattedData = validOrgs.map((org) => ({
          ...org,
          eventCount: org.events ? org.events.length : 0,
        }));
        setOrgs(formattedData);
        setFilteredOrgs(formattedData);
      }
      setLoading(false);
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    const results = orgs.filter(
      (org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.description &&
          org.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrgs(results);
  }, [searchTerm, orgs]);

  const iconStyle = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    fontSize: "18px",
    verticalAlign: "middle",
    color: "#718096",
  };

  const isValid = (val) => val && val !== "NULL" && val.trim() !== "";

  if (loading)
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        Loading Palouse Partners...
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        padding: "2rem 1rem",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#111",
              marginBottom: "0.5rem",
            }}
          >
            Community Organizations
          </h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>
            Discover local organizations making a difference in the Palouse
            region
          </p>
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "600px",
            margin: "0 auto 4rem auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <input
            type="text"
            placeholder="Search by name or mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1rem 1rem 3rem",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
            }}
          />
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "1.2rem",
              top: "1.1rem",
              color: "#999",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            search
          </span>
        </div>

        <div className="masonry-container">
          {filteredOrgs.length > 0 ? (
            filteredOrgs.map((org) => (
              <div key={org.id} className="masonry-item">
                <div
                  className="org-card"
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    border: "1px solid #edf2f7",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ marginBottom: "0.75rem" }}>
                    <h3
                      style={{
                        fontSize: "1.3rem",
                        margin: "0 0 0.3rem 0",
                        color: "#1a202c",
                        fontWeight: "800",
                        lineHeight: "1.2",
                      }}
                    >
                      {org.name}
                    </h3>
                    <div
                      style={{
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "0.55rem",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "inline-block",
                      }}
                    >
                      {isValid(org.location) ? org.location : "Palouse Area"}
                    </div>
                  </div>

                  <p
                    style={{
                      color: "#4a5568",
                      fontSize: "0.85rem",
                      lineHeight: "1.5",
                      marginBottom: "1rem",
                    }}
                  >
                    {org.description ||
                      "Connecting the community through local outreach and support."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                      color: "#718096",
                      fontSize: "0.8rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {org.eventCount > 0 && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={iconStyle}
                        >
                          calendar_today
                        </span>
                        {org.eventCount} active{" "}
                        {org.eventCount === 1 ? "event" : "events"}
                      </span>
                    )}

                    {isValid(org.phone_number) && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={iconStyle}
                        >
                          call
                        </span>
                        {org.phone_number}
                      </span>
                    )}

                    {isValid(org.email) && (
                      <a
                        href={`mailto:${org.email}`}
                        className="email-link"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#5f745d",
                          textDecoration: "none",
                          fontWeight: "600",
                          width: "fit-content",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ ...iconStyle, color: "#5f745d" }}
                        >
                          mail
                        </span>
                        {org.email}
                      </a>
                    )}
                  </div>

                  {org.eventCount > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <button
                        style={{
                          width: "100%",
                          backgroundColor: "#5f745d",
                          color: "white",
                          border: "none",
                          padding: "0.7rem",
                          borderRadius: "10px",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        View Events
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                width: "100%",
                padding: "4rem",
                color: "#718096",
              }}
            >
              <p>No organizations found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .masonry-container {
            column-count: 3;
            column-gap: 1.5rem;
            width: 100%;
          }

          .masonry-item {
            break-inside: avoid;
            margin-bottom: 1.5rem;
            display: inline-block;
            width: 100%;
          }

          .org-card {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .org-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 10px 18px -4px rgba(0,0,0,0.15);
          }

          .email-link:hover { text-decoration: underline !important; }

          @media (max-width: 1000px) {
            .masonry-container { column-count: 2; }
          }
          @media (max-width: 700px) {
            .masonry-container { column-count: 1; }
            .org-card { padding: 1.25rem !important; }
          }
        `}
      </style>
    </div>
  );
};

export default Organizations;
