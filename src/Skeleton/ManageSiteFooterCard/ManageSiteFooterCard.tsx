import "./ManageSiteFooterCard.scss";

export default function FooterCardsSkeleton() {
    // We render 3 cards to match the original layout
    const skeletonCards = Array(3).fill(null);

    return (
        <div className="financial-summary skeleton-loading-summary" dir="rtl">
            {/* Filter Section Skeleton */}
            <div className="footer-filter-section">
                <div className="skeleton-item skeleton-filter-label"></div>
                <div className="time-filter-buttons">
                    <div className="skeleton-item skeleton-filter-btn"></div>
                    <div className="skeleton-item skeleton-filter-btn"></div>
                    <div className="skeleton-item skeleton-filter-btn"></div>
                </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="summary-cards-container">
                {skeletonCards.map((_, index) => (
                    <div key={index} className="summary-card skeleton-card">
                        {/* Icon Circle */}
                        <div className="skeleton-item skeleton-icon-box"></div>

                        <div className="summary-content">
                            {/* Title Line */}
                            <div className="skeleton-item skeleton-text-title"></div>
                            {/* Value (Price) Line */}
                            <div className="skeleton-item skeleton-text-value"></div>
                            {/* Period Line */}
                            <div className="skeleton-item skeleton-text-period"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}