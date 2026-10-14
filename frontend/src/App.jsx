import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CertificatesPage from "./pages/CertificatesPage";
import NotificationsPage from "./pages/NotificationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import InstructorOverviewPage from "./pages/InstructorOverviewPage";
import InstructorCoursesPage from "./pages/InstructorCoursesPage";
import InstructorStudentsPage from "./pages/InstructorStudentsPage";
import InstructorEarningsPage from "./pages/InstructorEarningsPage";
import InstructorSettingsPage from "./pages/InstructorSettingsPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BrowseCoursesPage from "./pages/BrowseCoursesPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import InstructorLessonsPage from "./pages/InstructorLessonsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import RouteLoadingBar from "./components/RouteLoadingBar";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("loginTime", Date.now());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <BrowserRouter>
      <RouteLoadingBar />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage theme={theme} toggleTheme={toggleTheme} user={user} />
          }
        />
        <Route path="/login" element={<LoginPage login={login} />} />
        <Route path="/register" element={<RegisterPage login={login} />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/about"
          element={<AboutPage theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/contact"
          element={<ContactPage theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/courses"
          element={<CoursesPage theme={theme} toggleTheme={toggleTheme} />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <DashboardPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/courses"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <MyCoursesPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/browse"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <BrowseCoursesPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/certificates"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <CertificatesPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <NotificationsPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/payments"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <PaymentsPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/checkout"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <CheckoutPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <SettingsPage
                user={user}
                logout={logout}
                theme={theme}
                toggleTheme={toggleTheme}
                updateUser={updateUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/courses/:courseId"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <CoursePlayerPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute user={user} allowedRole="instructor">
              <InstructorOverviewPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute user={user} allowedRole="instructor">
              <InstructorCoursesPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/lessons"
          element={
            <ProtectedRoute user={user} allowedRole="instructor">
              <InstructorLessonsPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/students"
          element={
            <ProtectedRoute user={user} allowedRole="instructor">
              <InstructorStudentsPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/earnings"
          element={
            <ProtectedRoute user={user} allowedRole="instructor">
              <InstructorEarningsPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/settings"
          element={
            <ProtectedRoute user={user} allowedRole="instructor">
              <InstructorSettingsPage
                user={user}
                logout={logout}
                theme={theme}
                toggleTheme={toggleTheme}
                updateUser={updateUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
