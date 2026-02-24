import { Skeleton } from "@mui/material";
import "./LoginPageSkeleton.scss";

export default function LoginPageSkeleton() {
    return (
        <div className="login-page skeleton-page" dir="rtl">
            <div className="login-container">


                <div className="form-container">
                    <div id="loginform">
                        <div className="header-box">
                            <Skeleton variant="text" width="50%" height={40} sx={{mb: 1}}/>
                            <Skeleton variant="text" width="80%" height={20}/>
                        </div>

                        {[1, 2].map((i) => (
                            <div className="input-row" key={i} style={{marginBottom: '24px'}}>
                                <Skeleton variant="text" width="30%" height={20} sx={{mb: 1}}/>
                                <Skeleton variant="rectangular" width="100%" height={50} sx={{borderRadius: '16px'}}/>
                            </div>
                        ))}

                        <div className="button-row">
                            <Skeleton variant="rectangular" width="100%" height={55}
                                      sx={{borderRadius: '16px', mt: 2}}/>
                        </div>

                        <div className="footer-row"
                             style={{display: 'flex', justifyContent: 'center', marginTop: '30px'}}>
                            <Skeleton variant="text" width="60%" height={25}/>
                        </div>
                    </div>
                </div>


                <div className="login-image-placeholder">
                    <Skeleton variant="rectangular" width="100%" height="100%" animation="wave"/>
                </div>


            </div>
        </div>
    );
}