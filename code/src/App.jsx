import { useEffect, useState } from "react";
import './App.css'
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { supabase } from "./lib/supabase";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import PostEvent from "./pages/PostEvent";
import Admin from "./pages/Admin";

function ProtectedRoute({ children, session, loading }) {
  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(currentSession);
        setLoading(false);
      }
    };

    loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="app-layout">
        <Navbar session={session} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Landing session={session} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={
              <ProtectedRoute loading={loading} session={session}>
                <Register />
              </ProtectedRoute>
            } />
            <Route
              path="/home"
              element={
                <ProtectedRoute loading={loading} session={session}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<Navigate to="/home" replace />}
            />
            <Route path="/events" element={<Home session={session} />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route
              path="/post-event"
              element={
                <ProtectedRoute loading={loading} session={session}>
                  <PostEvent />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
