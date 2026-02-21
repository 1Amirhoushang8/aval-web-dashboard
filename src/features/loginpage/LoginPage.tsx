import React, { useState } from "react";
import "./LoginPage.scss";
import { useNavigate } from "react-router-dom";
import LoginImageSection from "../../components/LoginPageImageSetion/LoginPageImage.tsx";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (username === "amir" && password === "1234") {
            navigate("/ManageSite");
        } else {
            setError("نام کاربری یا رمز عبور اشتباه است");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                {/* Image Section */}
                <LoginImageSection />

                {/* Right Side - Login Form */}
                <div id="loginform" dir="rtl">
                    <h2 id="headerTitle">ورود به حساب کاربری</h2>

                    <div>
                        <div className="row">
                            <label>نام کاربری</label>
                            <input
                                type="text"
                                placeholder="نام کاربری خود را وارد کنید"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="row">
                            <label>رمز عبور</label>
                            <input
                                type="password"
                                placeholder="رمز عبور خود را وارد کنید"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>



                        <div id="button" className="row">
                            <button type="button" onClick={handleLogin}>
                                ورود
                            </button>
                        </div>

                        {error && <p className="error-text">{error}</p>}

                    </div>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;
