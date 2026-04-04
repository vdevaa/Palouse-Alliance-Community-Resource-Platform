import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/PalouseAlliance.avif";
import mobileMenuCloseIcon from "../assets/mobile-menu-close.svg";
import mobileMenuOpenIcon from "../assets/mobile-menu-open.svg";
import { supabase } from "../lib/supabase";
import "../styles/Navbar.css";

const Navbar = ({ session }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (!error) {
            setMobileMenuOpen(false);
            navigate("/login");
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen((currentState) => !currentState);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="site-navbar">
                <Link to="/" className="navbar-logo-link" aria-label="Palouse Alliance home">
                    <img
                        src={logo}
                        alt="Palouse Alliance Logo"
                        className="navbar-logo"
                    />
                </Link>

                <div className="navbar-desktop-links">
                    <a
                        href="https://wsu.givepulse.com/group/244255-palouse-alliance-for-healthy-individuals-families-communities"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar-link navbar-link-primary"
                    >
                        GivePulse
                    </a>

                    <Link to="/events" className="navbar-link navbar-link-text">Events</Link>
                    <Link to="/organizations" className="navbar-link navbar-link-text">Organizations</Link>
                    {session ? (
                        <Link to="/dashboard" className="navbar-link navbar-link-text">
                            Dashboard
                        </Link>
                    ) : null}
                    {session ? (
                        <button
                            onClick={handleLogout}
                            className="navbar-link navbar-link-outline navbar-button"
                            type="button"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="navbar-link navbar-link-outline">Login</Link>
                    )}
                    <Link to="/register" className="navbar-link navbar-link-accent">Register</Link>
                </div>

                <button
                    type="button"
                    className="navbar-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-navigation"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    <img
                        src={mobileMenuOpenIcon}
                        alt=""
                        className="navbar-menu-icon"
                        aria-hidden="true"
                    />
                </button>
            </nav>

            <div
                className={`navbar-overlay ${mobileMenuOpen ? "is-open" : ""}`}
                onClick={closeMobileMenu}
                aria-hidden="true"
            />

            <aside
                id="mobile-navigation"
                className={`navbar-mobile-drawer ${mobileMenuOpen ? "is-open" : ""}`}
                aria-hidden={!mobileMenuOpen}
            >
                <div className="navbar-mobile-header">
                    <img
                        src={logo}
                        alt="Palouse Alliance Logo"
                        className="navbar-mobile-logo"
                    />
                    <button
                        type="button"
                        className="navbar-mobile-close"
                        onClick={closeMobileMenu}
                        aria-label="Close navigation menu"
                    >
                        <img
                            src={mobileMenuCloseIcon}
                            alt=""
                            className="navbar-close-icon"
                            aria-hidden="true"
                        />
                    </button>
                </div>

                <div className="navbar-mobile-links">
                    <a
                        href="https://wsu.givepulse.com/group/244255-palouse-alliance-for-healthy-individuals-families-communities"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar-mobile-link navbar-link-primary"
                    >
                        GivePulse
                    </a>

                    <Link to="/events" className="navbar-mobile-link">Events</Link>
                    <Link to="/organizations" className="navbar-mobile-link">Organizations</Link>
                    {session ? (
                        <Link to="/dashboard" className="navbar-mobile-link">
                            Dashboard
                        </Link>
                    ) : null}
                    {session ? (
                        <button
                            onClick={handleLogout}
                            className="navbar-mobile-link navbar-mobile-button"
                            type="button"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="navbar-mobile-link">Login</Link>
                    )}
                    <Link to="/register" className="navbar-mobile-link navbar-link-accent">Register</Link>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
