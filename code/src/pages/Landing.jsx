import { Link } from "react-router-dom";
import "../styles/Landing.css";

const Landing = ({ session }) => {
  const userEmail = session?.user?.email;

  return (
    <div className="landing-page">
      <main className="landing-main">
        <section className="landing-hero">
          <h1>{userEmail ? `Welcome, ${userEmail}` : "Welcome"}</h1>
          <p>
            Discover local events, volunteer opportunities, and community resources
            across the Palouse region.
          </p>

          <div className="landing-actions">
            <Link to="/events" className="landing-button landing-button-primary">
              Browse Events
            </Link>
            <Link to="/organizations" className="landing-button landing-button-secondary">
              View Organizations
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
