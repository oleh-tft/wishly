import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/routes/paths";
import { SvgSidebarProfile, SvgSidebarReservation, SvgSidebarSettings, SvgSidebarShared, SvgSidebarWishlist } from "../common/Icons";

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t('sidebar.wishlists'), to: ROUTES.wishlists, icon: <SvgSidebarWishlist /> },
    { label: t('sidebar.shared'), to: ROUTES.sharedWishes, icon: <SvgSidebarShared /> },
    { label: t('sidebar.reservation'), to: ROUTES.reservation, icon: <SvgSidebarReservation /> },
    { label: t('sidebar.profile'), to: ROUTES.profile, icon: <SvgSidebarProfile />, isSpaced: true },
    { label: t('sidebar.settings'), to: ROUTES.settings, icon: <SvgSidebarSettings /> },
  ];

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">

        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.to);

          return (
            <li
              key={item.to}
              className={`menu-item ${isActive ? "active" : ""} ${item.isSpaced ? "menu-item-spaced" : ""}`.trim()}
            >
              {isActive && <span className="active-indicator"></span>}

              <NavLink to={item.to} className="menu-link">
                <div className="menu-icon">
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}

      </ul>
    </aside>
  );
}