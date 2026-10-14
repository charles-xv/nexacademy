import { Check } from "lucide-react";
import { Link } from "react-router";
import "./Pricing.css";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started with one course, no card required.",
    features: [
      "1 free course",
      "First 2 lessons of any course",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$50",
    period: "/month",
    description: "Full access to every course on the platform.",
    features: [
      "All courses unlocked",
      "Downloadable resources",
      "Certificate of completion",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing-header">
        <h2>Simple pricing</h2>
        <p>Start free. Upgrade whenever you're ready for more.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            className={`pricing-card ${plan.highlighted ? "pricing-card-highlighted" : ""}`}
            key={plan.name}
          >
            {plan.highlighted && (
              <span className="pricing-badge">Most popular</span>
            )}
            <h3>{plan.name}</h3>
            <div className="pricing-price">
              <span className="pricing-amount">{plan.price}</span>
              <span className="pricing-period">{plan.period}</span>
            </div>
            <p className="pricing-description">{plan.description}</p>
            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`pricing-btn ${plan.highlighted ? "primary" : "secondary"}`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Pricing;
