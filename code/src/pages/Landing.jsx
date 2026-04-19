import "../styles/Landing.css";

const Landing = () => {
  return (
    <div className="landing-page">
      <main className="page-shell landing-shell">
        <section className="page-hero landing-hero">
          <h1 className="page-title">Welcome to Palouse Alliance</h1>
          <p className="page-description">
            This landing page is being redesigned to better showcase community resources, events, and admin entry points.
          </p>
        </section>

        <section className="landing-placeholder page-panel">
          <p>
            Placeholder content for highlights, featured resources, and calls to action will go here.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Landing;
