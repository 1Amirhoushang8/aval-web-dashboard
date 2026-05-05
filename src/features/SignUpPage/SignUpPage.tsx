import React, { useState, useEffect } from "react";
import "./SignUpPage.scss";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import apiClient from "../../API/apiClient.ts";
import LoginImageSection from "../../components/LoginPageImageSetion/LoginPageImage.tsx";
import SignUpPageSkeleton from "../../Skeleton/SignUpPageSkeleton/SignUpPageSkeleton";
import { motion } from "framer-motion";

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        password: "",
        phoneNumber: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const farsiRegex = /^[\u0600-\u06FF\s]+$/;
        if (formData.fullName.trim().length < 4 || !farsiRegex.test(formData.fullName)) {
            setError("نام و نام خانوادگی باید حداقل ۴ کاراکتر و به زبان فارسی باشد");
            return;
        }

        const englishNoSpaceRegex = /^[A-Za-z0-9_]+$/;
        if (!englishNoSpaceRegex.test(formData.username)) {
            setError("نام کاربری باید فقط شامل حروف انگلیسی، اعداد و زیرخط باشد");
            return;
        }

        if (formData.password.length < 6) {
            setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
            return;
        }

        setLoading(true);

        try {
            await apiClient.post("/auth/register", {
                fullName: formData.fullName.trim(),
                username: formData.username.trim(),
                password: formData.password,
                phoneNumber: formData.phoneNumber.trim()
            });


            setError("ثبت نام با موفقیت انجام شد! در حال انتقال...");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err: unknown) {
            console.error("SignUp Error:", err);
            let errorMessage = "خطا در برقراری ارتباط با سرور";
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                // Backend returns { message: "..." } for validation errors
                if (responseData?.message) {
                    errorMessage = responseData.message;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <SignUpPageSkeleton />;
    }

    return (
        <motion.div
            className="signup-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="signup-container">
                <LoginImageSection />
                <form id="signupform" dir="rtl" onSubmit={handleSignUp}>
                    <h2 id="headerTitle">ثبت نام در سیستم</h2>

                    <div className="row">
                        <label>نام و نام خانوادگی (فارسی)</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="مثال: علی محمدی"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="row">
                        <label>نام کاربری (English - بدون فاصله)</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="row">
                        <label>شماره تماس</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="row">
                        <label>رمز عبور</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="حداقل ۶ کاراکتر"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div id="button" className="row">
                        <button type="submit" disabled={loading}>
                            {loading ? "در حال ثبت..." : "عضویت"}
                        </button>
                    </div>

                    <div className="row" style={{ textAlign: 'center', marginTop: '15px' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: '#666AF2', fontSize: '0.9rem' }}>
                            قبلاً ثبت نام کرده‌اید؟ وارد شوید
                        </Link>
                    </div>

                    {error && (
                        <div className="alert-box" style={{
                            marginTop: '20px',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: error.includes("موفقیت") ? '#e8f5e9' : '#ffebee',
                            color: error.includes("موفقیت") ? '#2e7d32' : '#c62828',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            border: `1px solid ${error.includes("موفقیت") ? '#a5d6a7' : '#ef9a9a'}`
                        }}>
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </motion.div>
    );
};

export default SignUpPage;