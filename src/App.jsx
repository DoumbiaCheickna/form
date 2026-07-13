import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Header from "./components/Header";
import StudentForm from "./pages/StudentForm";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <StudentForm />
            </>
          }
        />
        <Route
          path="/admin"
          element={
            authLoading ? (
              <div className="min-h-screen flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : user ? (
              <>
                <Header />
                <AdminDashboard user={user} />
              </>
            ) : (
              <AdminLogin onLogin={setUser} />
            )
          }
        />
      </Routes>
    </div>
  );
}
