export interface SidebarItemType {
    id: number;
    title: string;
    link: string;
    icon: React.ReactNode;
}

export interface SidebarPropsType {
    expanded: boolean;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    sidebarItems: SidebarItemType[];
}