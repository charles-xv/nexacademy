import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import LoadingBar from "./LoadingBar";

// Shows the top loading bar briefly on every route change, so navigating
// anywhere in the app gives the same feedback the course pages already had.
// It is intentionally short — a route change in an SPA is instant, so this
// is a visual cue that the page changed, not a real load timer. Data-heavy
// pages still show their own skeletons underneath.
function RouteLoadingBar() {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    // Don't flash on the very first paint.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setActive(true);
    const timer = setTimeout(() => setActive(false), 550);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return <LoadingBar active={active} />;
}

export default RouteLoadingBar;
