import React, { useState } from "react";
import "./SignUpPage.scss";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../API/apiClient.ts";
import LoginImageSection from "../../components/LoginPageImageSetion/LoginPageImage.tsx";
import type { User } from "../../models/AccountingInterfaces/AccountingInterface";

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();

    // Form States
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        password: "",
        phoneNumber: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Check if username already exists
            const existingUsers = await apiClient.get<User[]>("/users");
            const isDuplicate = existingUsers.data.some(
                (u) => u.username.toLowerCase() === formData.username.toLowerCase()
            );

            if (isDuplicate) {
                setError("این نام کاربری قبلاً انتخاب شده است");
                setLoading(false);
                return;
            }


            const newUser: Omit<User, "id"> = {
                FullName: formData.fullName,
                username: formData.username,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                roleKey: "USER",
                SerialNumber: Math.floor(10000000 + Math.random() * 90000000).toString(), // Random Serial
                service: "انتخاب نشده",
                price: "۰ تومان",
                status: "درحال-انجام",
                paymentType: "پرداخت-تکی",
                monthlyPayment: null,
                totalMonths: null
            };

            // 3. Post to JSON Server
            await apiClient.post("/users", newUser);


            alert("ثبت نام با موفقیت انجام شد");
            navigate("/");

        } catch (err) {
            console.error("SignUp Error:", err);
            setError("خطا در برقراری ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <LoginImageSection />
                <form id="loginform" dir="rtl" onSubmit={handleSignUp}>
                    <h2 id="headerTitle">ثبت نام در سیستم</h2>

                    <div className="row">
                        <label>نام و نام خانوادگی</label>
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
                        <label>نام کاربری</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="یک نام کاربری انتخاب کنید"
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
                            placeholder="********"
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
                        <p className="error-text" style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;