import {  Skeleton } from "@mui/material";
import "./SignUpPageSkeleton.scss";

export default function SignUpPageSkeleton() {
    return (
        <div className="signup-page skeleton-page" dir="rtl">
            <div className="signup-container">

                <div className="login-image-placeholder">
                    <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
                </div>

                <div className="form-container">
                    <div id="signupform">
                        <div className="header-box">
                            <Skeleton variant="text" width="40%" height={45} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="70%" height={25} />
                        </div>


                        {[1, 2, 3, 4].map((i) => (
                            <div className="input-row" key={i} style={{ marginBottom: '18px' }}>
                                <Skeleton variant="text" width="35%" height={20} sx={{ mb: 1, mr: 1 }} />
                                <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: '14px' }} />
                            </div>
                        ))}

                        <div className="button-row" style={{ marginTop: '20px' }}>
                            <Skeleton variant="rectangular" width="100%" height={55} sx={{ borderRadius: '16px' }} />
                        </div>

                        <div className="footer-row" style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                            <Skeleton variant="text" width="50%" height={25} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}