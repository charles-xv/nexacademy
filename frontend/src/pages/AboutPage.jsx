import {
  GraduationCap,
  Code2,
  ShieldCheck,
  Users,
  Target,
  Compass,
} from "lucide-react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AboutPage.css";

const values = [
  {
    icon: Code2,
    title: "Learn by building",
    text: "Every course is project-based. You finish with something you made, not just a video history and a certificate.",
  },
  {
    icon: Users,
    title: "Taught by practitioners",
    text: "Courses are built by people who do the work — developers, analysts and designers sharing what actually matters on the job.",
  },
  {
    icon: Compass,
    title: "A clear path",
    text: "Free and Pro tiers, lessons in order, progress you can see. No guesswork about what to learn next.",
  },
  {
    icon: ShieldCheck,
    title: "Your progress, protected",
    text: "Accounts, payments and course data are handled to real security standards — the same ones our cybersecurity courses teach.",
  },
];

function AboutPage({ theme, toggleTheme }) {
  return (
    <div className="about-page">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <section className="about-hero">
        <h1>
          Learning that leads to{" "}
          <span className="about-accent">real skills</span>
        </h1>
        <p>
          NeXaCaDeMy is an online learning platform for people who want to build
          practical, job-ready skills in technology and advance their careers 
          from beginner to master.
        </p>
      </section>

      <section className="about-mission">
        <div className="about-mission-inner">
          <span className="about-label">Our mission</span>
          <h2>
            To make hands on tech education accessible, structured and worth
            finishing.
          </h2>
          <p>
            Too many online courses are bought and never completed. We focus on
            the opposite: short, practical lessons, a clear order to follow, and
            visible progress so learning turns into skills you can point to.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-head">
          <h2>What we stand for</h2>
          <p>The ideas that shape every course on the platform.</p>
        </div>
        <div className="about-grid">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div className="about-card" key={v.title}>
                <div className="about-card-icon">
                  <Icon size={19} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="about-offer">
        <div className="about-offer-inner">
          <div className="about-offer-item">
            <Target size={18} />
            <div>
              <h4>Web development, data and design</h4>
              <p>
                Practical courses across the skills employers are hiring for.
              </p>
            </div>
          </div>
          <div className="about-offer-item">
            <GraduationCap size={18} />
            <div>
              <h4>Certificates you earn</h4>
              <p>Finish a course, get a credential that reflects real work.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Start learning today</h2>
        <p>Free courses are open to everyone. No card required.</p>
        <div className="about-cta-buttons">
          <Link to="/register" className="about-btn-primary">
            Create an account
          </Link>
          <Link to="/courses" className="about-btn-secondary">
            Browse courses
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
