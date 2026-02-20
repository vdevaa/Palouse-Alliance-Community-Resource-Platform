import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div style={{ padding: "1rem", background: "#ffffff" }}>
            <Link to="/" style={{ margin: "0 1rem" }}>Home</Link>
            <Link to="/login" style={{ margin: "0 1rem" }}>Login</Link>
            <Link to="/register" style={{ margin: "0 1rem" }}>Register</Link>
            <Link to="/dashboard" style={{ margin: "0 1rem" }}>Dashboard</Link>
            <Link to="/organizations" style={{ margin: "0 1rem" }}>Organizations</Link>
            <Link to="/postevent" style={{ margin: "0 1rem" }}>PostEvent</Link>
            <Link to="/admin" style={{ margin: "0 1rem" }}>Admin</Link>
        </div>
    );
};

export default Navbar;