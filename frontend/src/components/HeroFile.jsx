import { Play, Award } from "lucide-react";
import { Link } from "react-router";
import { ShieldCheck, Code2,} from "lucide-react";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Build Real Skills That{" "}
          <span className="hero-accent">Move Your Career</span>
        </h1>
        <p>
          Learn web development, data analytics and cybersecurity through hands
          on courses, built by working professionals.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">
            <Play size={14} />
            Start free course
          </Link>
          <Link to="/courses" className="btn-secondary">
            See all courses
          </Link>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <strong>2,300+</strong>
            <span>Active students</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <strong>40+</strong>
            <span>Courses</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <strong>4.8</strong>
            <span>Avg rating</span>
          </div>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-glow" />

        <div className="shape shape-square" />
        <div className="shape shape-circle" />
        <div className="shape shape-ring" />
        <div className="shape shape-pill" />
        <div className="shape shape-dot shape-dot-1" />
        <div className="shape shape-dot shape-dot-2" />
        <div className="shape shape-dot shape-dot-3" />

        <div className="hero-chip hero-chip-1">
          <ShieldCheck size={16} />
          <span>OWASP-tested</span>
        </div>
        <div className="hero-chip hero-chip-2">
          <Code2 size={16} />
          <span>Project-based</span>
        </div>
        <div className="hero-chip hero-chip-3">
          <Award size={16} />
          <span>Earn certificates</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
