import React from 'react';
import { Link } from "react-router-dom";
import logo from "../assets/PalouseTextLogo.png";
import "../styles/Footer.css";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo-row">
                        <img
                            src={logo}
                            alt="Palouse Alliance logo"
                            className="footer-logo"
                        />
                    </div>
                    <p className="footer-copy">
                        Connecting individuals, families, and communities through accessible community resources and events.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/events">Member Events</Link></li>
                        <li><Link to="/organizations">Organizations</Link></li>
                        <li>
                            <a
                                href="https://wsu.givepulse.com/group/244255-palouse-alliance-for-healthy-individuals-families-communities"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GivePulse
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Help & Support</h4>
                    <div className="footer-contact-list">
                        <div className="footer-contact-item">
                            <span className="material-symbols-outlined footer-icon" aria-hidden="true">alternate_email</span>
                            <span>info@palousealliance.org</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="material-symbols-outlined footer-icon" aria-hidden="true">phone</span>
                            <span>(555) 123-4567</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="material-symbols-outlined footer-icon" aria-hidden="true">place</span>
                            <span>Palouse Region, Idaho & Washington</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                © 2026 Palouse Alliance. All rights reserved. Serving individuals, families, and communities.
            </div>
        </footer>
    );
};

export default Footer;