import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const isVisibleOrg = (org) => {
    const name = org.name?.trim()?.toLowerCase();
    return Boolean(name && name !== "unaffiliated");
  };

  const isValid = (val) => val && val !== "NULL" && val.trim() !== "";

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
        const visibleOrgs = data.filter(isVisibleOrg);
        const formattedData = visibleOrgs.map((org) => ({
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

  if (loading)
    return (
      <div className="organizations-page page-root organizations-loading">
        Loading Palouse Partners...
      </div>
    );

  return (
    <div className="organizations-page page-root">
      <div className="organizations-shell">
        <div className="organizations-header">
          <h1 className="organizations-title">Community Organizations</h1>
          <p className="organizations-subtitle">
            Discover local organizations making a difference in the Palouse
            region
          </p>
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by name or mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="material-symbols-outlined search-input-icon">
            search
          </span>
        </div>

        <div className="events-header">
          <div>
            <h2>
              {filteredOrgs.length} {filteredOrgs.length === 1 ? "Organization" : "Organizations"} Found
            </h2>
          </div>
        </div>

        <div className="masonry-container">
          {filteredOrgs.length > 0 ? (
            filteredOrgs.map((org) => {
              const displayName = isValid(org.name)
                ? org.name
                : "Community Organization";
              const displayDescription = isValid(org.description)
                ? org.description
                : "Connecting the community through local outreach and support.";
              const displayLocation = isValid(org.location)
                ? org.location
                : "Palouse Area";
              const hasOrgInfo =
                org.eventCount > 0 ||
                isValid(org.phone_number) ||
                isValid(org.email);

              return (
                <div key={org.id} className="masonry-item">
                  <div className="org-card">
                    <div className="org-card-heading">
                      <h3 className="org-title">{displayName}</h3>
                      <div className="org-location-chip">{displayLocation}</div>
                    </div>

                    <p className="org-description">{displayDescription}</p>

                    {hasOrgInfo && (
                      <div className="org-meta">
                        {org.eventCount > 0 && (
                          <span className="org-meta-row">
                            <span className="material-symbols-outlined org-meta-icon">
                              calendar_today
                            </span>
                            {org.eventCount} active{' '}
                            {org.eventCount === 1 ? 'event' : 'events'}
                          </span>
                        )}

                        {isValid(org.phone_number) && (
                          <span className="org-meta-row">
                            <span className="material-symbols-outlined org-meta-icon">
                              call
                            </span>
                            {org.phone_number}
                          </span>
                        )}

                        {isValid(org.email) && (
                          <a
                            href={`mailto:${org.email}`}
                            className="email-link org-meta-row"
                          >
                            <span className="material-symbols-outlined org-meta-icon">
                              mail
                            </span>
                            {org.email}
                          </a>
                        )}
                      </div>
                    )}

                    {org.eventCount > 0 && (
                      <div className="org-card-footer">
                        <button className="btn-primary org-cta-btn" type="button">
                          View Events
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              <p>No organizations found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .organizations-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .organizations-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin-bottom: 0.5rem;
          }

          .organizations-subtitle {
            color: var(--color-text-subtle);
            font-size: 1.1rem;
            margin: 0;
          }

          .search-wrapper {
            position: relative;
            max-width: 600px;
            margin: 0 auto 4rem auto;
            width: 100%;
            box-sizing: border-box;
          }

          .search-input {
            width: 100%;
            padding: 0.95rem 1rem 0.95rem 3rem;
            border-radius: 999px;
            border: 1px solid var(--color-border);
            font-size: var(--text-sm);
            font-family: inherit;
            box-shadow: var(--shadow-sm);
            box-sizing: border-box;
            background: var(--color-surface);
            color: var(--color-text);
            min-height: 44px;
          }

          .search-input:focus {
            outline: none;
            border-color: var(--color-primary-700);
            box-shadow: var(--focus-ring);
          }

          .search-input-icon {
            position: absolute;
            left: 1.2rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-text-subtle);
            font-variation-settings: 'FILL' 1;
          }

          .organizations-result-summary {
            max-width: 600px;
            margin: 0 auto 1.5rem auto;
            color: var(--color-text-muted);
            font-size: 0.95rem;
            text-align: center;
          }

          .organizations-shell {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
          }

          .organizations-loading {
            padding: var(--space-6);
            text-align: center;
          }

          .org-card {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            transition: transform var(--default-transition-duration) var(--default-transition-timing-function), box-shadow var(--default-transition-duration) var(--default-transition-timing-function);
          }

          .org-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 10px 18px -4px rgba(0,0,0,0.15);
          }

          .org-card-heading {
            margin-bottom: 0.75rem;
          }

          .org-title {
            font-size: 1.3rem;
            margin: 0 0 0.3rem 0;
            color: var(--color-text);
            font-weight: 800;
            line-height: 1.2;
          }

          .org-location-chip {
            background-color: var(--color-accent-50);
            color: var(--color-warning);
            padding: 0.25rem 0.5rem;
            border-radius: 999px;
            font-size: 0.65rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-block;
          }

          .org-description {
            color: var(--color-text-subtle);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1rem;
          }

          .org-meta {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            color: var(--color-text-subtle);
            font-size: 0.95rem;
          }

          .org-meta-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .org-meta-icon {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            font-size: 18px;
            color: var(--color-text-subtle);
            vertical-align: middle;
          }

          .org-card-footer {
            margin-top: 1rem;
          }

          .org-cta-btn {
            width: 100%;
            padding: var(--space-3) var(--space-4);
            border-radius: var(--radius-md);
            font-size: var(--text-sm);
          }

          .email-link.org-meta-row {
            color: var(--color-primary-700);
            text-decoration: none;
            font-weight: 600;
            width: fit-content;
          }

          .no-results {
            text-align: center;
            width: 100%;
            padding: var(--space-6);
            color: var(--color-text-subtle);
          }

          .email-link.org-meta-row:hover {
            text-decoration: underline;
          }

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

          .email-link:hover { text-decoration: underline !important; }

          @media (max-width: 1000px) {
            .masonry-container { column-count: 2; }
          }
          @media (max-width: 700px) {
            .masonry-container { column-count: 1; }
            .org-card { padding: var(--space-5) !important; }
          }
        `}
      </style>
    </div>
  );
};

export default Organizations;
