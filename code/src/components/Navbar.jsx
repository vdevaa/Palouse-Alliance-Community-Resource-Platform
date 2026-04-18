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
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    // Fetch user's role to determine whether to show Register link
    useEffect(() => {
        let mounted = true;
        const loadRole = async () => {
            setIsAdmin(false);
            if (!session?.user?.id) return;

            const userId = session.user.id;
            const { data, error } = await supabase
                .from("users")
                .select("role")
                .eq("id", userId)
                .maybeSingle();

            if (!mounted) return;
            if (!error && data && data.role === "admin") {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        };

        loadRole();
        return () => {
            mounted = false;
        };
    }, [session]);

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
                    <div className="navbar-link-group">
                        <Link to="/" className="navbar-link navbar-link-text">Home</Link>
                        <a
                            href="https://wsu.givepulse.com/group/244255-palouse-alliance-for-healthy-individuals-families-communities"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-link navbar-link-text"
                        >
                            GivePulse
                        </a>

                        <Link to="/events" className="navbar-link navbar-link-text">Events</Link>
                        <Link to="/organizations" className="navbar-link navbar-link-text">Organizations</Link>
                        {session ? (
                            <Link to="/post-event" className="navbar-link navbar-link-accent">
                                Post Event
                            </Link>
                        ) : null}
                    </div>

                    <div className="navbar-action-group">
                        {session ? (
                            <button
                                onClick={handleLogout}
                                className="navbar-link navbar-link-secondary navbar-button"
                                type="button"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="navbar-link navbar-link-primary">Login</Link>
                        )}
                        {isAdmin ? (
                            <Link to="/register" className="navbar-link navbar-link-primary">Register</Link>
                        ) : null}
                    </div>
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
                        className="navbar-mobile-link"
                    >
                        GivePulse
                    </a>

                    <Link to="/" className="navbar-mobile-link">Home</Link>
                    <Link to="/events" className="navbar-mobile-link">Events</Link>
                    <Link to="/organizations" className="navbar-mobile-link">Organizations</Link>
                    {session ? (
                        <Link to="/post-event" className="navbar-mobile-link navbar-link-accent">
                            Post Event
                        </Link>
                    ) : null}
                    {session ? (
                        <button
                            onClick={handleLogout}
                            className="navbar-mobile-link navbar-link-secondary navbar-mobile-button"
                            type="button"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="navbar-mobile-link navbar-link-primary">Login</Link>
                    )}
                    {isAdmin ? (
                        <Link to="/register" className="navbar-mobile-link navbar-link-primary">Register</Link>
                    ) : null}
                </div>
            </aside>
        </>
    );
};

export default Navbar;
