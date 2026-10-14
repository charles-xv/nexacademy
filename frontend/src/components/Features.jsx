import { Code2, Award, ShieldCheck } from 'lucide-react';
import './Features.css';

// Data-driven, same pattern as navLinks in Navbar —
// add a 4th feature later by adding one object here,
// not by writing a new block of JSX.
const features = [
  {
    icon: Code2,
    title: 'Hands-on courses',
    description: 'Every course is project-based — you build real things, not just watch videos.',
  },
  {
    icon: Award,
    title: 'Expert instructors',
    description: 'Taught by working professionals in web development, data and cybersecurity.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    description: 'Your data and progress are protected to the same standard we teach in our courses.',
  },
];

function Features() {
  return (
    <section className="features">
      <div className="features-header">
        <h2>Why learn with NeXaCaDeMy</h2>
        <p>Built for people who want real skills, not just certificates.</p>
      </div>

      <div className="features-grid">
        {features.map((feature) => {
          // Icon is stored as the component itself, so we assign it
          // to a capitalized variable to render it dynamically —
          // JSX needs that capital letter to treat it as a component.
          const Icon = feature.icon;
          return (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Features;