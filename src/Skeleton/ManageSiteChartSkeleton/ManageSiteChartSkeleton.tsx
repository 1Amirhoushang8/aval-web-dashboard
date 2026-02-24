import "./ManageSiteChartSkeleton.scss";

export default function ManageSiteChartSkeleton() {

    const skeletonBars = Array(7).fill(null);

    return (
        <div className="financial-chart-section skeleton-loading" dir="rtl">

            <div className="chart-header">
                <div className="chart-title-section">
                    <div className="skeleton-item skeleton-title"></div>
                    <div className="time-filter-buttons">
                        <div className="skeleton-item skeleton-button"></div>
                        <div className="skeleton-item skeleton-button"></div>
                        <div className="skeleton-item skeleton-button"></div>
                    </div>
                </div>

                <div className="chart-legend">
                    <div className="legend-item skeleton-legend">
                        <div className="skeleton-item skeleton-circle"></div>
                        <div className="skeleton-item skeleton-text-short"></div>
                    </div>
                    <div className="legend-item skeleton-legend">
                        <div className="skeleton-item skeleton-circle"></div>
                        <div className="skeleton-item skeleton-text-short"></div>
                    </div>
                </div>
            </div>


            <div className="big-chart-container">
                <div className="vertical-bar-chart">

                    <div className="chart-y-axis">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton-item skeleton-y-label"></div>
                        ))}
                    </div>


                    <div className="chart-bars-container">
                        {skeletonBars.map((_, index) => (
                            <div key={index} className="chart-bar-group">
                                <div className="skeleton-item skeleton-bar-label"></div>
                                <div className="bars-wrapper">
                                    <div className="skeleton-item skeleton-bar-item req-bar"></div>
                                    <div className="skeleton-item skeleton-bar-item pay-bar"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="chart-x-axis">
                        <div className="skeleton-item skeleton-x-label"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}