import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (isMounted) {
          setErrorMessage("You are not signed in.");
          setLoading(false);
        }
        return;
      }

      if (!isMounted) {
        return;
      }

      setEmail(user.email ?? "");

      setLoading(false);
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="dashboard-page page-root">
      <div className="dashboard-content">
        <h1>{loading ? "Loading..." : `Hello, ${email}`}</h1>
        {errorMessage && (
          <p className="dashboard-error-message">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
