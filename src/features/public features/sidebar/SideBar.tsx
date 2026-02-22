import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, IconButton, List, ListItem, useTheme, useMediaQuery } from "@mui/material";
import { CgMenuLeft } from "react-icons/cg";
import { AiOutlineLogout } from "react-icons/ai";
import "./SideBar.scss";
import type { SidebarPropsType } from "../../../models/SideBarInterface/SidebarInterface";

const Sidebar: React.FC<SidebarPropsType> = ({ expanded, setExpanded, sidebarItems }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <>
            {/* Mobile Header */}
            {isMobile && (
                <div className="mobile_header">
                    <span className="toggle" onClick={() => setExpanded(!expanded)}>☰</span>
                    <h1 style={{fontSize: '1.2rem'}}>پنل مدیریت</h1>
                </div>
            )}

            {/* Backdrop for mobile only - prevents the "shadow" from sticking */}
            {isMobile && expanded && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setExpanded(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998
                    }}
                />
            )}

            <Box
                dir="rtl"
                className={`sidebar_wrapper ${isMobile && expanded ? "res_visible_sidebar" : ""}`}
                sx={{ zIndex: 999 }}
            >
                <IconButton onClick={() => setExpanded(!expanded)}>
                    <CgMenuLeft size={23} color="#fff" />
                </IconButton>

                <List>
                    {sidebarItems.map(item => (
                        <ListItem
                            key={item.id}
                            sx={{
                                background: location.pathname === item.link ? "rgba(255,255,255,0.15)" : "transparent",
                                borderRadius: "8px",
                                marginBottom: "8px"
                            }}
                        >
                            <Link to={item.link} className="sidebar-link" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', width: '100%' }}>
                                <span className="icon" style={{ marginLeft: '12px' }}>{item.icon}</span>
                                <span className="title">{item.title}</span>
                            </Link>
                        </ListItem>
                    ))}
                </List>

                <IconButton
                    sx={{ color: "#fff", gap: "10px", marginTop: 'auto', padding: '20px' }}
                    onClick={handleLogout}
                >
                    <AiOutlineLogout size={23} />
                    <span className="title">خروج</span>
                </IconButton>
            </Box>
        </>
    );
};

export default Sidebar;