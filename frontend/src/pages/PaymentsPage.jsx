import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Receipt, CreditCard, Crown } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { CURRENCY } from "../data/currency";
import "./PaymentsPage.css";
import { API_URL } from "../api";


function PaymentsPage({ user, logout }) {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, histRes] = await Promise.all([
          fetch(API_URL + "/get-subscription.php?user_id=" + user.id),
          fetch(API_URL + "/get-billing-history.php?user_id=" + user.id),
        ]);
        const subData = await subRes.json();
        const histData = await histRes.json();
        setSubscription(subData);
        setHistory(Array.isArray(histData) ? histData : []);
      } catch (err) {
        setSubscription({ plan: "free", status: "active" });
        setHistory([]);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const isPro = subscription?.plan === "pro";

  // Only real money movements count. Free plan rows are 0.00 and are
  // part of the plan timeline, not the spend.
  const totalSpent = history
    .filter((row) => Number(row.amount) > 0)
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value.replace(" ", "T")).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="payments-header">
        <h1>Subscription</h1>
        <p>Your current plan and billing history.</p>
      </div>

      {loading ? (
        <div className="empty-state">
          <CreditCard size={26} />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="payments-summary">
            <div className="payment-summary-card">
              <div className="payment-summary-icon">
                <Crown size={18} />
              </div>
              <div>
                <p className="payment-summary-value">
                  {isPro ? "Pro" : "Free"}
                </p>
                <span className="payment-summary-label">
                  {isPro
                    ? "Renews " + formatDate(subscription.expires_at)
                    : "Current plan"}
                </span>
              </div>
            </div>
            <div className="payment-summary-card">
              <div className="payment-summary-icon">
                <Receipt size={18} />
              </div>
              <div>
                <p className="payment-summary-value">
                  {CURRENCY}
                  {totalSpent.toLocaleString()}
                </p>
                <span className="payment-summary-label">Total spent</span>
              </div>
            </div>
          </div>

          {!isPro && (
            <div className="payments-upgrade-banner">
              <div>
                <p>Unlock every course on the platform</p>
                <span>
                  Pro gives you full access, downloads and certificates.
                </span>
              </div>
              <Link to="/dashboard/checkout" className="payments-upgrade-btn">
                Upgrade to Pro
              </Link>
            </div>
          )}

          <div className="section-head">
            <h3>Billing history</h3>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={26} />
              <p>No billing history yet</p>
              <span>Your plan changes and payments will appear here</span>
            </div>
          ) : (
            <div className="payments-list">
              {history.map((row) => (
                <div className="payment-row" key={row.id}>
                  <div className="payment-row-icon">
                    <Crown size={16} />
                  </div>
                  <div className="payment-row-info">
                    <p>{row.plan === "pro" ? "Pro plan" : "Free plan"}</p>
                    <span>
                      {formatDate(row.started_at)}
                      {row.expires_at ? " - " + formatDate(row.expires_at) : ""}
                    </span>
                  </div>
                  <div className="payment-row-right">
                    <span className="payment-row-amount">
                      {Number(row.amount) > 0
                        ? CURRENCY + Number(row.amount).toLocaleString()
                        : "-"}
                    </span>
                    <span className={"payment-row-status status-" + row.status}>
                      {row.status === "active"
                        ? "Active"
                        : row.status === "expired"
                          ? "Expired"
                          : "Cancelled"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default PaymentsPage;
