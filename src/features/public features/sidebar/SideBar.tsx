import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    IconButton,
    List,
    ListItem,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { CgMenuLeft } from "react-icons/cg";
import { AiOutlineLogout } from "react-icons/ai";
import "./SideBar.scss";
import type { SidebarPropsType } from "../../../models/SideBarInterface/SidebarInterface";

const Sidebar: React.FC<SidebarPropsType> = ({ expanded, setExpanded, sidebarItems }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <>
            {isMobile && (
                <div className="mobile_header">
                    <span className="toggle" onClick={() => setExpanded(p => !p)}>
                        ☰
                    </span>
                    <h1>Dashboard</h1>
                </div>
            )}

            <Box
                dir="rtl"
                className={`sidebar_wrapper ${isMobile && expanded ? "res_visible_sidebar" : ""}`}
            >
                <IconButton onClick={() => setExpanded(p => !p)}>
                    <CgMenuLeft size={23} color="#fff" />
                </IconButton>

                <List>
                    {sidebarItems.map(item => (
                        <ListItem
                            key={item.id}
                            sx={{
                                background:
                                    location.pathname === item.link
                                        ? theme.palette.primary.light
                                        : "transparent",
                            }}
                        >
                            <Link to={item.link}>
                                <span className="icon">{item.icon}</span>
                                <span className="title">{item.title}</span>
                            </Link>
                        </ListItem>
                    ))}
                </List>

                <IconButton
                    sx={{ color: "#fff", gap: "10px" }}
                    onClick={() => {
                        setExpanded(false);
                        navigate("/");
                    }}
                >
                    <AiOutlineLogout size={23} />
                    <span className="title">خروج</span>
                </IconButton>
            </Box>
        </>
    );
};

export default Sidebar;
