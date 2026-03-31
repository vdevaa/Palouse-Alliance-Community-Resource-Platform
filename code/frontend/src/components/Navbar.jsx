import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/PalouseAlliance.avif";
import { supabase } from "../lib/supabase";

const Navbar = ({ session }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (!error) {
            navigate("/login");
        }
    };

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
                <a 
                    href="https://wsu.givepulse.com/group/244255-palouse-alliance-for-healthy-individuals-families-communities" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                        textDecoration: "none", 
                        color: "#fff", 
                        background: "#007bff", 
                        padding: "0.5rem 1.5rem", 
                        borderRadius: "8px",
                        fontWeight: "500"
                    }}
                >
                    GivePulse
                </a>

                <Link to="/events" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Events</Link>
                <Link to="/organizations" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Organizations</Link>
                {session ? (
                    <Link to="/dashboard" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>
                        Dashboard
                    </Link>
                ) : null}
                {session ? (
                    <button
                        onClick={handleLogout}
                        style={{
                            background: "#ffffff",
                            color: "#333",
                            padding: "0.5rem 1.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            fontWeight: "500",
                            cursor: "pointer",
                            fontSize: "1rem"
                        }}
                        type="button"
                    >
                        Logout
                    </button>
                ) : (
                    <Link to="/login" style={{ 
                        textDecoration: "none", 
                        color: "#333", 
                        padding: "0.5rem 1.5rem", 
                        border: "1px solid #ccc", 
                        borderRadius: "8px",
                        fontWeight: "500"
                    }}>Login</Link>
                )}
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
