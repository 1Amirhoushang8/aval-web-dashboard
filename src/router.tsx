import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Layout from "./layout.tsx";
import LoginPage from "./features/loginpage/LoginPage.tsx";
import ManageSitePage from "./features/ManageSite/ManagePage.tsx";
import AccountingPage from "./features/Accounting/Accounting.tsx";
import AdminTicketPage from "./features/AdminTicketPage/AdminTicketPage.tsx";
import UserMyTicketsPage from "./features/UserSeeTicket/UserSeeTicket.tsx";
import ManageTicketPage from "./features/TicketPage/TicketPage.tsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return <Navigate to="/" replace />;
    if (user.roleKey !== allowedRole) return <Navigate to="/" replace />;
    return <>{children}</>;
};

export default function Router() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper key="login"><LoginPage /></PageWrapper>} />

                <Route element={<Layout />}>
                    {/* ADMIN PAGES */}
                    <Route path="/ManageSite" element={<ProtectedRoute allowedRole="ADMIN"><PageWrapper key="manage"><ManageSitePage /></PageWrapper></ProtectedRoute>} />
                    <Route path="/Accountp" element={<ProtectedRoute allowedRole="ADMIN"><PageWrapper key="account"><AccountingPage /></PageWrapper></ProtectedRoute>} />
                    <Route path="/AdminTicketPage" element={<ProtectedRoute allowedRole="ADMIN"><PageWrapper key="admin-tickets"><AdminTicketPage /></PageWrapper></ProtectedRoute>} />

                    {/* USER PAGES */}
                    <Route path="/MyTickets" element={<ProtectedRoute allowedRole="USER"><PageWrapper key="my-tickets"><UserMyTicketsPage /></PageWrapper></ProtectedRoute>} />
                    <Route path="/SendTicket" element={<ProtectedRoute allowedRole="USER"><PageWrapper key="send-ticket"><ManageTicketPage /></PageWrapper></ProtectedRoute>} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ width: "100%", height: "100%" }}>
        {children}
    </motion.div>
);