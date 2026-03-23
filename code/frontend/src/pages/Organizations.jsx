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
          location,
          email,
          events (id)
        `)
        .order("name", { ascending: true });

      if (error) {
        console.error(error.message);
      } else {
        const formattedData = data.map(org => ({
          ...org,
          eventCount: org.events ? org.events.length : 0
        }));
        setOrgs(formattedData);
        setFilteredOrgs(formattedData);
      }
      setLoading(false);
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    const results = orgs.filter(org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrgs(results);
  }, [searchTerm, orgs]);

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading Palouse Partners...</div>;

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#111", marginBottom: "0.5rem" }}>Community Organizations</h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>Discover local organizations making a difference in the Palouse region</p>
        </div>

        <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto 4rem auto" }}>
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
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          />
          <span style={{ position: "absolute", left: "1.2rem", top: "1.1rem" }}>🔍</span>
        </div>

        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", fontWeight: "600", color: "#333" }}>
          {filteredOrgs.length} Organizations
        </h2>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "2rem" 
        }}>
          {filteredOrgs.length > 0 ? (
            filteredOrgs.map((org, index) => (
              <div key={index} style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "1.5rem",
                border: "1px solid #edf2f7",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.2rem", margin: 0, color: "#1a202c", flex: 1, fontWeight: "700" }}>
                      {org.name}
                    </h3>
                    <span style={{ 
                      backgroundColor: "#fef3c7", 
                      color: "#92400e", 
                      padding: "4px 12px", 
                      borderRadius: "20px", 
                      fontSize: "0.75rem", 
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      marginLeft: "10px"
                    }}>
                      {org.location || "Palouse Area"}
                    </span>
                  </div>
                  
                  <p style={{ color: "#4a5568", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                    {org.description || "Connecting the community through local outreach and support."}
                  </p>

                  <div style={{ display: "flex", gap: "1rem", color: "#718096", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      📅 {org.eventCount > 0 
                        ? `${org.eventCount} active ${org.eventCount === 1 ? 'event' : 'events'}` 
                        : "No active events"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <button style={{ 
                    flex: 1, 
                    backgroundColor: "#5f745d", 
                    color: "white", 
                    border: "none", 
                    padding: "0.8rem", 
                    borderRadius: "8px", 
                    fontWeight: "600",
                    cursor: "pointer"
                  }}>
                    View Details
                  </button>
                  {org.email && (
                    <a href={`mailto:${org.email}`} style={{
                      padding: "0.8rem", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0", 
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none"
                    }}>
                      ✉️
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "4rem", color: "#718096" }}>
              <p>No organizations found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organizations;