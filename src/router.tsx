import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layout.tsx";
import LoginPage from "./features/loginpage/LoginPage.tsx";
import AccountingPage from "./features/Accounting/Accounting.tsx";
import ManageSitePage from "./features/ManageSite/ManagePage.tsx";
import ManageTicketPage from "./features/TicketPage/TicketPage.tsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function Router() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route element={<Layout />}>
                    <Route
                        path="/Accountp"
                        element={
                            <PageWrapper>
                                <AccountingPage />
                            </PageWrapper>
                        }
                    />
                    <Route
                        path="/ManageSite"
                        element={
                            <PageWrapper>
                                <ManageSitePage />
                            </PageWrapper>
                        }
                    />
                    <Route
                        path="/TicketPage"
                        element={
                            <PageWrapper>
                                <ManageTicketPage />
                            </PageWrapper>
                        }
                    />
                </Route>

                <Route
                    path="/"
                    element={
                        <PageWrapper>
                            <LoginPage />
                        </PageWrapper>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}


const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", height: "100%" }}
        >
            {children}
        </motion.div>
    );
};
