import "./ManageSiteFooterCard.scss";

export default function FooterCardsSkeleton() {

    const skeletonCards = Array(3).fill(null);

    return (
        <div className="financial-summary skeleton-loading-summary" dir="rtl">

            <div className="footer-filter-section">
                <div className="skeleton-item skeleton-filter-label"></div>
                <div className="time-filter-buttons">
                    <div className="skeleton-item skeleton-filter-btn"></div>
                    <div className="skeleton-item skeleton-filter-btn"></div>
                    <div className="skeleton-item skeleton-filter-btn"></div>
                </div>
            </div>


            <div className="summary-cards-container">
                {skeletonCards.map((_, index) => (
                    <div key={index} className="summary-card skeleton-card">

                        <div className="skeleton-item skeleton-icon-box"></div>

                        <div className="summary-content">

                            <div className="skeleton-item skeleton-text-title"></div>

                            <div className="skeleton-item skeleton-text-value"></div>

                            <div className="skeleton-item skeleton-text-period"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}