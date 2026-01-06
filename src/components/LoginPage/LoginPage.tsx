import React, { useState } from "react";
import "./LoginPage.scss";
import { useNavigate } from "react-router-dom";
import type {FormInputProps, FormButtonProps} from "../../models/LoginPageInterfaces/LoginInterface.ts"

const LoginForm: React.FC = () => {
    return (
        <div className="login-page">
            <div id="loginform" dir="rtl">
                <FormHeader title="ورود به حساب کاربری" />
                <Form />
                <OtherMethods />
            </div>
        </div>
    );
};

export default LoginForm;

/* ---------- Sub Components ---------- */

type FormHeaderProps = {
    title: string;
};

const FormHeader: React.FC<FormHeaderProps> = ({ title }) => (
    <h2 id="headerTitle">{title}</h2>
);

const Form: React.FC = () => {
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
        <div>
            <FormInput
                description="نام کاربری"
                placeholder="نام کاربری خود را وارد کنید"
                type="text"
                value={username}
                onChange={setUsername}
            />

            <FormInput
                description="رمز عبور"
                placeholder="رمز عبور خود را وارد کنید"
                type="password"
                value={password}
                onChange={setPassword}
            />

            {error && <p className="error-text">{error}</p>}

            <FormButton title="ورود" onClick={handleLogin} />
        </div>
    );
};



const FormInput: React.FC<FormInputProps> = ({
                                                 description,
                                                 placeholder,
                                                 type,
                                                 value,
                                                 onChange,
                                             }) => (
    <div className="row">
        <label>{description}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);



const FormButton: React.FC<FormButtonProps> = ({ title, onClick }) => (
    <div id="button" className="row">
        <button type="button" onClick={onClick}>
            {title}
        </button>
    </div>
);

const OtherMethods: React.FC = () => (
    <div id="alternativeLogin">
        <label className="link-info cursor">فراموشی رمز عبور</label>

    </div>
);


