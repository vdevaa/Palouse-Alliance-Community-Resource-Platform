import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: "#333",
            color: "#fff",
            padding: "3rem 0",
            width: "100vw",        /* Forces it to the full width of the viewport */
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",   /* Centers the 100vw element if parent has padding */
            marginTop: "auto"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                maxWidth: "1200px", /* Keeps text from touching the very edges */
                margin: "0 auto",
                padding: "0 2rem"
            }}>
                <div>
                    <h4 style={{ color: "#981e32", textTransform: "uppercase", fontSize: "0.9rem" }}>Resources</h4>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem", color: "#ccc" }}>
                        <li style={{ margin: "0.5rem 0" }}>Placeholder Link</li>
                        <li style={{ margin: "0.5rem 0" }}>Placeholder Link</li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: "#981e32", textTransform: "uppercase", fontSize: "0.9rem" }}>Organization</h4>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem", color: "#ccc" }}>
                        <li style={{ margin: "0.5rem 0" }}>Placeholder Link</li>
                        <li style={{ margin: "0.5rem 0" }}>Placeholder Link</li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: "#981e32", textTransform: "uppercase", fontSize: "0.9rem" }}>Connect</h4>
                    <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>Contact Us</p>
                    <p style={{ margin: "0.5rem 0", fontSize: "0.8rem", color: "#888" }}>© 2026 Palouse Alliance</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;