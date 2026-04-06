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
    <div style={{ padding: "2rem", color: "#111827" }}>
      <h1>{loading ? "Loading..." : `Hello, ${email}`}</h1>
      {errorMessage && (
        <p style={{ color: "#b91c1c", marginTop: "0.75rem" }}>{errorMessage}</p>
      )}
    </div>
  );
};

export default Dashboard;
