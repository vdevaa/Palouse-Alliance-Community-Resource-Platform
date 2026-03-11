import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../App.css";

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("name, description, phone_number, email, location")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching organizations:", error);
      } else {
        setOrgs(data || []);
      }
      setLoading(false);
    };

    fetchOrgs();
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading Organizations...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#981e32", marginBottom: "1.5rem" }}>Partner Organizations</h1>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {orgs.length > 0 ? (
          orgs.map((org, index) => (
            <div key={index} style={{
              border: "1px solid #eee",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              background: "#fff"
            }}>
              <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0", color: "#333" }}>{org.name}</h2>
              
              {org.description && (
                <p style={{ color: "#555", fontSize: "0.9rem", marginTop: "0.5rem" }}>{org.description}</p>
              )}

              <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
                {org.location && <p>📍 {org.location}</p>}
                {org.phone_number && <p>📞 {org.phone_number}</p>}
                {org.email && (
                  <p>
                    ✉️ <a href={`mailto:${org.email}`} style={{ color: "#007bff", textDecoration: "none" }}>{org.email}</a>
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No organizations found.</p>
        )}
      </div>
    </div>
  );
};

export default Organizations;