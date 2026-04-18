import { Skeleton } from "@mui/material";
import "./LoginPageSkeleton.scss";

const LoginPageSkeleton: React.FC = () => {
    return (
        <div className="login-page skeleton-page">
            <div className="login-container">
                {/* Image skeleton – first child in LTR container, appears on left */}
                <div className="login-image-placeholder">
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        animation="wave"
                        sx={{ borderRadius: 0 }}
                    />
                </div>

                {/* Form skeleton – right side on desktop, RTL for text alignment */}
                <form id="loginform" dir="rtl">
                    <h2 id="headerTitle">
                        <Skeleton variant="text" width="70%" height={40} />
                    </h2>

                    <div className="row">
                        <label>
                            <Skeleton variant="text" width="30%" height={20} />
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
                            <Skeleton variant="text" width="30%" height={20} />
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
                        <Skeleton variant="text" width="60%" height={25} sx={{ margin: "0 auto" }} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPageSkeleton;