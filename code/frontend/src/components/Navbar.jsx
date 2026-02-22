import { Link } from "react-router-dom";
import logo from "../assets/PalouseAlliance.avif";

const Navbar = () => {
    return (
        <nav style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "70px",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 4rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            zIndex: 1000,
            boxSizing: "border-box"
        }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <img 
                    src={logo} 
                    alt="Palouse Alliance Logo" 
                    style={{ height: "50px", width: "auto" }} 
                />
            </Link>
            
            <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                <Link to="/events" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Events</Link>
                <Link to="/organizations" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Organizations</Link>
                <Link to="/login" style={{ 
                    textDecoration: "none", 
                    color: "#333", 
                    padding: "0.5rem 1.5rem", 
                    border: "1px solid #ccc", 
                    borderRadius: "8px",
                    fontWeight: "500"
                }}>Login</Link>
                <Link to="/register" style={{ 
                    textDecoration: "none", 
                    color: "#fff", 
                    background: "#981e32", 
                    padding: "0.5rem 1.5rem", 
                    borderRadius: "8px",
                    fontWeight: "500"
                }}>Register</Link>
            </div>
        </nav>
    );
};

export default Navbar;