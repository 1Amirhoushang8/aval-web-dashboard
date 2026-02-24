import React from "react";
import "./TicketTitleSkeleton.scss";

const TicketTitleSkeleton: React.FC = () => {
    return (
        <div className="field skeleton-loading-title" dir="rtl">

            <div className="skeleton-item skeleton-label"></div>

            <div className="dropdown-wrapper">
                <div className="dropdown-header">

                    <div className="skeleton-item skeleton-input-text"></div>

                    <div className="dropdown-controls">

                        <div className="skeleton-item skeleton-arrow"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketTitleSkeleton;