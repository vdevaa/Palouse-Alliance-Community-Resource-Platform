import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/Organizations.css";

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
            placeholder="Search by organization name..."
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
    </div>
  );
};

export default Organizations;
