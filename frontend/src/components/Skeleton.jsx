import './Skeleton.css';

// Building blocks for loading states.
//
// A skeleton should echo the SHAPE of what is coming, not just say
// "loading". That way the layout does not jump when real data arrives,
// and the wait feels shorter because the page already looks like itself.

export function SkeletonBox({ width = '100%', height = 14, radius = 6, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

// A course tile placeholder — matches the thumbnail + title + meta layout
// used across the catalogue, browse and my-courses grids.
export function SkeletonCourseCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <span className="skeleton skeleton-thumb" />
      <div className="skeleton-card-body">
        <SkeletonBox width="75%" height={14} />
        <SkeletonBox width="45%" height={11} />
        <SkeletonBox width="90%" height={10} />
        <div className="skeleton-card-foot">
          <SkeletonBox width="40%" height={12} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCourseGrid({ count = 6, className = '' }) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCourseCard key={i} />
      ))}
    </div>
  );
}

// A generic table-ish row, for the admin lists.
export function SkeletonRow() {
  return (
    <div className="skeleton-row" aria-hidden="true">
      <SkeletonBox width={38} height={38} radius={10} />
      <div className="skeleton-row-text">
        <SkeletonBox width="55%" height={13} />
        <SkeletonBox width="35%" height={11} />
      </div>
      <SkeletonBox width={70} height={22} radius={99} />
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export default SkeletonBox;
