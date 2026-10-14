import Navbar from "../components/Navbar";
import Hero from "../components/HeroFile";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";
import { Navigate } from "react-router";
import "../App.css";

function LandingPage({ theme, toggleTheme, user }) {
  if (user) {
    const home =
      user.role === "instructor"
        ? "/instructor"
        : user.role === "admin"
          ? "/admin"
          : "/dashboard";
    return <Navigate to={home} replace />;
  }
  return (
    <div className="app">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}

export default LandingPage;
