import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, Info, CheckCircle2, Lock } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { CURRENCY } from "../data/currency";
import "./CheckoutPage.css";
import { API_URL } from "../api";

function CheckoutPage({ user, logout }) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();

  // Group the digits in fours as the user types.
  const onCardChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
    const parts = digits.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(" ") : "");
    if (error) setError("");
  };

  const onExpiryChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setExpiry(
      digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits,
    );
    if (error) setError("");
  };

  // Same Luhn check the server runs, done here first so the user gets
  // told immediately instead of after a round trip.
  const luhnValid = (value) => {
    let sum = 0;
    let alt = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let d = parseInt(value[i], 10);
      if (alt) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const digits = cardNumber.replace(/\s/g, "");

    if (!cardName.trim()) return setError("Enter the name on the card.");
    if (digits.length < 12 || digits.length > 19)
      return setError("Card number must be between 12 and 19 digits.");
    if (!luhnValid(digits)) return setError("That card number is not valid.");
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry))
      return setError("Expiry must be in MM/YY format.");
    if (!/^[0-9]{3,4}$/.test(cvv))
      return setError("CVV must be 3 or 4 digits.");

    setLoading(true);
    try {
      const res = await fetch(API_URL + "/process-payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          card_name: cardName,
          card_number: digits,
          expiry: expiry,
          cvv: cvv,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Payment could not be completed.");
        setLoading(false);
        return;
      }

      setReceipt(data);
      setLoading(false);
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <DashboardLayout user={user} logout={logout}>
        <div className="checkout-wrap">
          <div className="receipt-card">
            <CheckCircle2 size={44} className="receipt-tick" />
            <h1>Payment successful</h1>
            <p className="receipt-sub">Your account is now on the Pro plan.</p>

            <div className="receipt-lines">
              <div className="receipt-line">
                <span>Reference</span>
                <strong>{receipt.reference}</strong>
              </div>
              <div className="receipt-line">
                <span>Plan</span>
                <strong>Pro, 30 days</strong>
              </div>
              <div className="receipt-line">
                <span>Amount</span>
                <strong>
                  {CURRENCY}
                  {receipt.amount}
                </strong>
              </div>
              <div className="receipt-line">
                <span>Card</span>
                <strong>Ending {receipt.last_four}</strong>
              </div>
              <div className="receipt-line">
                <span>Renews</span>
                <strong>{receipt.expires_at.split(" ")[0]}</strong>
              </div>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={() => navigate("/dashboard/payments")}
            >
              Back to subscription
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="checkout-wrap">
        <Link to="/dashboard/payments" className="checkout-back">
          Back to subscription
        </Link>

        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-sub">
          Review your order and complete the payment.
        </p>

        <div className="checkout-banner">
          <Info size={17} />
          <div>
            <strong>Simulated payment</strong>
            <p>
              This is a demonstration checkout. No real payment is taken and no
              card details are stored. Enter any valid test numbers.
            </p>
          </div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form-panel">
            <h2>Payment details</h2>

            {error && <p className="checkout-error">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="checkout-field">
                <label htmlFor="card_name">Name on card</label>
                <input
                  id="card_name"
                  type="text"
                  placeholder="Name as shown on card"
                  value={cardName}
                  onChange={(e) => {
                    setCardName(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="card_number">Card number</label>
                <input
                  id="card_number"
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={onCardChange}
                />
              </div>

              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="expiry">Expiry</label>
                  <input
                    id="expiry"
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={onExpiryChange}
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/\D/g, ""));
                      if (error) setError("");
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="checkout-btn" disabled={loading}>
                {loading ? "Processing..." : "Pay " + CURRENCY + "50.00"}
              </button>

              <p className="checkout-note">
                <Lock size={13} /> Card details are validated and discarded.
                They are never written to the database.
              </p>
            </form>
          </div>

          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <div className="summary-line">
              <span>NeXAcaDemY Pro</span>
              <strong>{CURRENCY}50.00</strong>
            </div>
            <div className="summary-line">
              <span>Billing period</span>
              <strong>30 days</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{CURRENCY}50.00</strong>
            </div>
            <p className="summary-note">
              <ShieldCheck size={14} /> The price is fixed on the server and
              cannot be altered from the browser.
            </p>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CheckoutPage;
