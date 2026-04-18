import React, { useState, useEffect } from "react";
import "./LoginPage.scss";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../API/apiClient.ts";
import LoginImageSection from "../../components/LoginPageImageSetion/LoginPageImage.tsx";
import type { User } from "../../models/AccountingInterfaces/AccountingInterface";
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
            const [usersRes, adminsRes] = await Promise.all([
                apiClient.get<User[]>("/users"),
                apiClient.get<User[]>("/admins"),
            ]);

            const allUsers = usersRes.data;
            const allAdmins = adminsRes.data;

            const findInArray = (array: User[]): User | undefined =>
                array.find(
                    (u: User) =>
                        u.username?.toLowerCase().trim() === username.toLowerCase().trim() &&
                        u.password?.toString().trim() === password.trim()
                );

            const adminMatch = findInArray(allAdmins);
            const userMatch = findInArray(allUsers);

            if (adminMatch) {
                const adminData = { ...adminMatch, roleKey: "ADMIN" };
                localStorage.setItem("user", JSON.stringify(adminData));
                localStorage.setItem("token", "fake-admin-token");
                navigate("/ManageSite", { replace: true });
            } else if (userMatch) {
                const userData = { ...userMatch, roleKey: "USER" };
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("token", "fake-user-token");
                navigate("/MyTickets", { replace: true });
            } else {
                setError("نام کاربری یا رمز عبور اشتباه است");
            }
        } catch (err) {
            console.error("Connection error:", err);
            setError("اتصال به سرور برقرار نشد...");
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

                {/* Form section */}
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