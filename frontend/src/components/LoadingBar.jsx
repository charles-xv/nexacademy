import { useEffect, useState } from 'react';
import './LoadingBar.css';

// A thin bar across the top of the viewport while something is in flight.
//
// It creeps toward 90% rather than tracking real progress, because a
// fetch does not report how far along it is. When the work finishes it
// snaps to 100% and fades — which reads as "done" far better than a bar
// that sits still.

function LoadingBar({ active }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;

    if (active) {
      setVisible(true);
      setProgress(8);
      // Slows down as it climbs, so it never quite reaches the end.
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + (90 - prev) * 0.12));
      }, 200);
    } else if (visible) {
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 320);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [active]);

  if (!visible) return null;

  return (
    <div className="loading-bar-track" role="progressbar" aria-hidden="true">
      <div
        className={`loading-bar-fill${progress === 100 ? ' is-done' : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default LoadingBar;
