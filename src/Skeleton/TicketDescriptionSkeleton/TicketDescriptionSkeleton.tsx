import React from "react";
import "./TicketDescriptionSkeleton.scss";

const TicketDescriptionSkeleton: React.FC = () => {
    return (
        <div className="field textarea skeleton-loading-desc" dir="rtl">

            <div className="skeleton-item skeleton-label"></div>


            <div className="skeleton-item skeleton-textarea"></div>


            <div className="char-count">
                <div className="skeleton-item skeleton-counter"></div>
            </div>
        </div>
    );
};

export default TicketDescriptionSkeleton;