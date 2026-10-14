import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "../api";

const GOOGLE_CLIENT_ID =
  "434026129074-28nbg8jti6nam55nsc1hm807676jin8n.apps.googleusercontent.com";

function GoogleOneTap({ login, context = "login", getRole }) {
  const targetRef = useRef(null);
  const loginRef = useRef(login);
  const getRoleRef = useRef(getRole);
  const navigate = useNavigate();
  const navRef = useRef(navigate);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loginRef.current = login;
    getRoleRef.current = getRole;
    navRef.current = navigate;
  }, [login, getRole, navigate]);

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    let initialized = false;

    function redirect(role) {
      if (role === "instructor") navRef.current("/instructor");
      else if (role === "admin") navRef.current("/admin");
      else navRef.current("/dashboard");
    }

    function handleCredential(response) {
      setError("");
      setStatus("Signing you in...");

      const chosenRole =
        typeof getRoleRef.current === "function"
          ? getRoleRef.current()
          : "student";

      fetch(API_URL + "/google-auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
          role: chosenRole,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (cancelled) return;
          setStatus("");
          if (!result.ok || result.data.error) {
            setError(
              result.data.error || "Google sign-in failed. Please try again.",
            );
            return;
          }
          const user = result.data.user || result.data;
          if (typeof loginRef.current === "function") loginRef.current(user);
          redirect(user.role);
        })
        .catch(function () {
          if (cancelled) return;
          setStatus("");
          setError("Could not reach the server. Is XAMPP running?");
        });
    }

    function build() {
      if (cancelled) return false;
      const g = window.google;
      if (!g || !g.accounts || !g.accounts.id) return false;
      if (!targetRef.current) return false;
      if (initialized) return true;
      initialized = true;

      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";

      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        context: context === "signup" ? "signup" : "signin",
      });

      targetRef.current.innerHTML = "";
      g.accounts.id.renderButton(targetRef.current, {
        type: "standard",
        theme: isDark ? "filled_black" : "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
        width: 300,
      });
      return true;
    }

    if (!build()) {
      let tries = 0;
      timer = setInterval(function () {
        tries = tries + 1;
        if (build() || tries > 40) {
          clearInterval(timer);
          timer = null;
          if (tries > 40 && !cancelled) {
            setError(
              "Google script did not load. Check your connection, then refresh.",
            );
          }
        }
      }, 200);
    }

    return function () {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [context]);

  return (
    <div className="gsi-wrap">
      <div className="gsi-divider">
        <span>or</span>
      </div>
      <div ref={targetRef} className="gsi-target"></div>
      {status && <p className="gsi-status">{status}</p>}
      {error && <p className="gsi-error">{error}</p>}
    </div>
  );
}

export default GoogleOneTap;