import React, { useState } from "react";
import "./LoginPage.scss";
import { useNavigate } from "react-router-dom";
import apiClient from "../../API/apiClient.ts";
import LoginImageSection from "../../components/LoginPageImageSetion/LoginPageImage.tsx";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Force the URL to the users collection
            const response = await apiClient.get("/users");
            const users = response.data;

            // Debugging: This will show you exactly what the server sent
            console.log("Server Users List:", users);
            console.log("Attempting login with:", { username, password });

            const foundUser = users.find((u: any) =>
                u.username.toLowerCase().trim() === username.toLowerCase().trim() &&
                u.password.toString().trim() === password.trim()
            );

            if (foundUser) {
                localStorage.setItem("user", JSON.stringify(foundUser));

                // Set a fake token for your interceptor to work
                localStorage.setItem("token", "fake-session-token");

                if (foundUser.roleKey === "ADMIN") {
                    navigate("/ManageSite");
                } else {
                    navigate("/MyTickets");
                }
            } else {
                setError("نام کاربری یا رمز عبور اشتباه است");
            }
        } catch (err) {
            console.error("Connection error:", err);
            setError("اتصال برقرار نشد. بررسی کنید json-server روی پورت ۴۰۰۰ در حال اجرا باشد.");
        }
    };;

    return (
        <div className="login-page">
            <div className="login-container">
                <LoginImageSection />
                <form id="loginform" dir="rtl" onSubmit={handleLogin}>
                    <h2 id="headerTitle">ورود به پنل کاربری</h2>
                    <div className="row">
                        <label>نام کاربری</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="row">
                        <label>رمز عبور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div id="button" className="row">
                        <button type="submit">ورود</button>
                    </div>
                    {error && <p className="error-text" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;