import React from "react";
import "./TicketFileUploadSkeleton.scss";

const TicketFileUploadSkeleton: React.FC = () => {
    return (
        <div className="file-section skeleton-loading-file" dir="rtl">

            <div className="skeleton-item skeleton-file-btn"></div>


            <div className="file-restrictions">
                <div className="skeleton-item skeleton-restrictions-text"></div>
            </div>


            <div className="file-preview">
                <div className="skeleton-preview-content">
                    <div className="skeleton-item skeleton-icon-circle"></div>
                    <div className="skeleton-preview-details">
                        <div className="skeleton-item skeleton-text-line"></div>
                        <div className="skeleton-item skeleton-text-line short"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFileUploadSkeleton;