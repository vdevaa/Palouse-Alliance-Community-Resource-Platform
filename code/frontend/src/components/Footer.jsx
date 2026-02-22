import React from 'react';
import logo from "../assets/PalouseLogo.avif";

const Footer = () => {
    const iconStyle = {
        fontSize: "1.2rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        marginRight: "10px",
        verticalAlign: "middle"
    };

    return (
        <footer style={{
            background: "#5F7457",
            color: "#ffffff",
            padding: "4rem 0 2rem 0",
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            boxSizing: "border-box",
            marginTop: "auto",
            textAlign: "left"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 2rem",
                display: "flex",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                gap: "6rem",
                boxSizing: "border-box"
            }}>
                <div style={{ flex: "0 1 auto", minWidth: "300px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <img 
                            src={logo} 
                            alt="Logo" 
                            style={{ height: "50px", width: "auto" }} 
                        />
                        <span style={{ fontWeight: "bold", fontSize: "1.4rem" }}>
                            Palouse Alliance
                        </span>
                    </div>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#f0f0f0", maxWidth: "400px", margin: "0" }}>
                        Connecting individuals, families, and communities through accessible community resources and events.
                    </p>
                </div>

                <div style={{ flex: "0 1 auto", minWidth: "150px" }}>
                    <h4 style={{ margin: "0 0 1.2rem 0", fontSize: "1.1rem" }}>Quick Links</h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.95rem", lineHeight: "2.2" }}>
                        <li>Browse Events</li>
                        <li>Organizations</li>
                        <li>Register Organization</li>
                        <li>Post an Event</li>
                    </ul>
                </div>

                <div style={{ flex: "0 1 auto", minWidth: "250px" }}>
                    <h4 style={{ margin: "0 0 1.2rem 0", fontSize: "1.1rem" }}>Help & Support</h4>
                    <div style={{ fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={iconStyle}>✉</span>
                            <span>info@palousealliance.org</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={iconStyle}>📞</span>
                            <span>(555) 123-4567</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={iconStyle}>📍</span>
                            <span>Palouse Region, Idaho & Washington</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                maxWidth: "1200px",
                margin: "3rem auto 0 auto",
                padding: "2rem 2rem 0 2rem",
                borderTop: "1px solid rgba(255,255,255,0.2)",
                fontSize: "0.85rem",
                color: "#f0f0f0",
                boxSizing: "border-box",
                textAlign: "left"
            }}>
                © 2026 Palouse Alliance. All rights reserved. Serving individuals, families, and communities.
            </div>
        </footer>
    );
};

export default Footer;