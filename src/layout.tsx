import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./features/public features/sidebar/SideBar";

export default function Layout() {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <Sidebar
                expanded={expanded}
                setExpanded={setExpanded}
                sidebarItems={[
                    {
                        id: 1,
                        title: "مدیریت سایت",
                        link: "/ManageSite",
                        icon: <i className="bi bi-house-door" />,
                    },
                    {
                        id: 2,
                        title: "حسابداری",
                        link: "/Accountp",
                        icon: <i className="bi bi-person" />,
                    },
                    {
                        id: 3,
                        title: "تیکت‌ها",
                        link: "/AdminTicketPage",
                        icon: <i className="bi bi-envelope" />,
                    },
                ]}
            />

            <div className="page-content">
                <Outlet />
            </div>
        </div>
    );
}
