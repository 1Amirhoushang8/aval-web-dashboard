import { Skeleton } from "@mui/material";
import "./SignUpPageSkeleton.scss";

const SignUpPageSkeleton: React.FC = () => {
    return (
        <div className="signup-page skeleton-page">
            <div className="signup-container">
                {/* Image skeleton – left side on desktop, top on tablet, hidden on mobile */}
                <div className="signup-image-placeholder">
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        animation="wave"
                        sx={{ borderRadius: 0 }}
                    />
                </div>

                {/* Form skeleton – right side on desktop, RTL for text alignment */}
                <form id="signupform" dir="rtl">
                    <h2 id="headerTitle">
                        <Skeleton variant="text" width="40%" height={45} />
                    </h2>

                    <div className="row">
                        <label>
                            <Skeleton variant="text" width="35%" height={20} />
                        </label>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={50}
                            sx={{ borderRadius: "14px" }}
                        />
                    </div>

                    <div className="row">
                        <label>
                            <Skeleton variant="text" width="35%" height={20} />
                        </label>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={50}
                            sx={{ borderRadius: "14px" }}
                        />
                    </div>

                    <div className="row">
                        <label>
                            <Skeleton variant="text" width="35%" height={20} />
                        </label>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={50}
                            sx={{ borderRadius: "14px" }}
                        />
                    </div>

                    <div className="row">
                        <label>
                            <Skeleton variant="text" width="35%" height={20} />
                        </label>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={50}
                            sx={{ borderRadius: "14px" }}
                        />
                    </div>

                    <div id="button" className="row">
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={55}
                            sx={{ borderRadius: "16px" }}
                        />
                    </div>

                    <div className="row" style={{ textAlign: "center", marginTop: "15px" }}>
                        <Skeleton variant="text" width="50%" height={25} sx={{ margin: "0 auto" }} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPageSkeleton;