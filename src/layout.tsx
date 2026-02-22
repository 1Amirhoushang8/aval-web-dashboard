import { Outlet, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Sidebar from "./features/public features/sidebar/SideBar";

export default function Layout() {
    const [expanded, setExpanded] = useState(false);
    const location = useLocation();

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const role = user?.roleKey || "USER";

    useEffect(() => {
        setExpanded(false);
    }, [location.pathname]);

    const sidebarItems = useMemo(() => {
        const allItems = [
            { id: 1, title: "مدیریت مالی", link: "/ManageSite", icon: <i className="bi bi-speedometer2" />, roles: ["ADMIN"] },
            { id: 2, title: "سرویس/خدمت", link: "/Accountp", icon: <i className="bi bi-wallet2" />, roles: ["ADMIN"] },
            { id: 3, title: "تیکت‌ها", link: "/AdminTicketPage", icon: <i className="bi bi-inbox" />, roles: ["ADMIN"] },

            { id: 4, title: "تیکت‌های من", link: "/MyTickets", icon: <i className="bi bi-card-list" />, roles: ["USER"] },
            { id: 5, title: "ارسال تیکت جدید", link: "/SendTicket", icon: <i className="bi bi-pencil-square" />, roles: ["USER"] },
        ];
        return allItems.filter(item => item.roles.includes(role));
    }, [role]);

    return (
        <div>
            <Sidebar expanded={expanded} setExpanded={setExpanded} sidebarItems={sidebarItems} />
            <div className="page-content">
                <Outlet />
            </div>
        </div>
    );
}