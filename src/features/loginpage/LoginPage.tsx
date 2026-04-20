import React, { useState, useEffect } from "react";
import "./LoginPage.scss";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import apiClient from "../../API/apiClient.ts";
import LoginImageSection from "../../components/LoginPageImageSetion/LoginPageImage.tsx";
import LoginPageSkeleton from "../../Skeleton/LoginPageSkeleton/LoginPageSkeleton";
import { motion } from "framer-motion";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await apiClient.post("/auth/login", {
                username,
                password,
            });

            const { user, token } = response.data;

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            if (user.roleKey === "ADMIN") {
                navigate("/ManageSite", { replace: true });
            } else {
                navigate("/MyTickets", { replace: true });
            }
        } catch (err) {
            console.error("Login error:", err);

            let errorMessage = "اتصال به سرور برقرار نشد...";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        }
    };

    if (pageLoading) {
        return <LoginPageSkeleton />;
    }

    return (
        <motion.div
            className="login-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="login-container">
                <LoginImageSection />

                <form id="loginform" dir="rtl" onSubmit={handleLogin}>
                    <h2 id="headerTitle">ورود به پنل کاربری</h2>

                    <div className="row">
                        <label>نام کاربری</label>
                        <input
                            type="text"
                            placeholder="نام کاربری خود را وارد کنید"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="row">
                        <label>رمز عبور</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div id="button" className="row">
                        <button type="submit">ورود</button>
                    </div>

                    <div className="row" style={{ textAlign: "center", marginTop: "15px" }}>
            <span style={{ fontSize: "0.9rem", color: "#666" }}>
              حساب کاربری ندارید؟{" "}
            </span>
                        <Link
                            to="/signup"
                            style={{
                                textDecoration: "none",
                                color: "#666AF2",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                            }}
                        >
                            ثبت نام
                        </Link>
                    </div>

                    {error && (
                        <div
                            className="alert-box"
                            style={{
                                backgroundColor: "#ffebee",
                                color: "#c62828",
                                border: "1px solid #ef9a9a",
                            }}
                        >
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </motion.div>
    );
};

export default LoginPage;