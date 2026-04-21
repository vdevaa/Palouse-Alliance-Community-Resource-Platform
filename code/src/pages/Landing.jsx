import React from 'react';
import { useNavigate } from "react-router-dom";
import logo from "../assets/PalouseTextLogo.png";
import "../styles/Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page page-root">
      <main className="page-shell landing-shell">
        
        <section className="page-hero landing-hero-main">
          <div className="org-location-chip legacy-chip">Since 1984</div>
          <img src={logo} alt="Palouse Alliance" className="hero-logo-img" draggable="false" />
          <h1 className="page-title">
            Building a Healthier <br/>
            <span className="accent-text">Palouse Community</span>
          </h1>
          <p className="page-description">
            Your central interagency consortium for health and human service providers 
            across the Palouse region.
          </p>
          <div className="landing-actions">
            <button 
              className="btn-primary landing-btn" 
              onClick={() => navigate('/events')}
            >
              Member Events
            </button>
            <button 
              className="btn-outline landing-btn" 
              onClick={() => navigate('/organizations')}
            >
              Organizations
            </button>
          </div>
        </section>

        <div className="masonry-container landing-pillars">
          <div className="masonry-item">
            <div className="org-card static-pillar-card">
              <span className="material-symbols-outlined pillar-icon" aria-hidden="true">handshake</span>
              <h3 className="org-title">Coordinate</h3>
              <p className="org-description">
                Bridging gaps between regional providers to ensure seamless community support systems.
              </p>
            </div>
          </div>

          <div className="masonry-item">
            <div className="org-card static-pillar-card">
              <span className="material-symbols-outlined pillar-icon" aria-hidden="true">menu_book</span>
              <h3 className="org-title">Resource</h3>
              <p className="org-description">
                Maintaining a reliable guide of essential services for individuals and families.
              </p>
            </div>
          </div>

          <div className="masonry-item">
            <div className="org-card static-pillar-card">
              <span className="material-symbols-outlined pillar-icon" aria-hidden="true">groups</span>
              <h3 className="org-title">Advocate</h3>
              <p className="org-description">
                A collective voice for human service professionals in our region.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
