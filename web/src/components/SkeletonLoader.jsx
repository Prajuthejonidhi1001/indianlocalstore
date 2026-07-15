import './SkeletonLoader.css';

export function SkeletonProductCard() {
  return (
    <div className="skeleton-product-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-shop"></div>
        <div className="skeleton-footer">
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}
