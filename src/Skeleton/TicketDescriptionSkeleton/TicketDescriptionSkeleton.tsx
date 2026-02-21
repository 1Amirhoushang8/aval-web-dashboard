import React from "react";
import "./TicketDescriptionSkeleton.scss";

const TicketDescriptionSkeleton: React.FC = () => {
    return (
        <div className="field textarea skeleton-loading-desc" dir="rtl">
            {/* Label Skeleton */}
            <div className="skeleton-item skeleton-label"></div>

            {/* Textarea Box Skeleton */}
            <div className="skeleton-item skeleton-textarea"></div>

            {/* Character Count Skeleton */}
            <div className="char-count">
                <div className="skeleton-item skeleton-counter"></div>
            </div>
        </div>
    );
};

export default TicketDescriptionSkeleton;