import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  getSessionCacheValue,
  isSessionCacheFresh,
  readSessionCache,
  writeSessionCache,
  ORGANIZATIONS_PAGE_CACHE_KEY,
} from "../lib/sessionCache";
import "../styles/Organizations.css";

const ORGANIZATIONS_CACHE_TTL_MS = 10 * 60 * 1000;

const Organizations = () => {
  const navigate = useNavigate();
  const cachedOrganizationsEntry = readSessionCache(ORGANIZATIONS_PAGE_CACHE_KEY);
  const cachedOrganizations = getSessionCacheValue(cachedOrganizationsEntry);
  const initialOrganizations = Array.isArray(cachedOrganizations) ? cachedOrganizations : [];

  const [orgs, setOrgs] = useState(initialOrganizations);
  const [filteredOrgs, setFilteredOrgs] = useState(initialOrganizations);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(!Array.isArray(cachedOrganizations));

  const isVisibleOrg = (org) => {
    const name = org.name?.trim()?.toLowerCase();
    return Boolean(name && name !== "unaffiliated");
  };

  const isValid = (val) => val && val !== "NULL" && val.trim() !== "";

  useEffect(() => {
    const cachedEntry = readSessionCache(ORGANIZATIONS_PAGE_CACHE_KEY);
    const cachedOrgs = getSessionCacheValue(cachedEntry);

    if (Array.isArray(cachedOrgs)) {
      setOrgs(cachedOrgs);
      setFilteredOrgs(cachedOrgs);
    }

    if (Array.isArray(cachedOrgs) && isSessionCacheFresh(cachedEntry, ORGANIZATIONS_CACHE_TTL_MS)) {
      setLoading(false);
      return;
    }

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
        writeSessionCache(ORGANIZATIONS_PAGE_CACHE_KEY, formattedData);
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

  return (
    <div className="organizations-page page-root">
      <main className="page-shell organizations-shell">
        <section className="page-hero organizations-header">
          <h1 className="page-title">Community Organizations</h1>
          <p className="page-description">
            Discover local organizations making a difference in the Palouse.
            region
          </p>
        </section>

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
                        <button
                          className="btn-primary org-cta-btn"
                          type="button"
                          onClick={() => navigate(`/events?q=${encodeURIComponent(org.name)}`)}
                        >
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
              {loading ? (
                <>
                  <p>Loading organizations...</p>
                </>
              ) : (
                <p>No organizations found matching "{searchTerm}"</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Organizations;
