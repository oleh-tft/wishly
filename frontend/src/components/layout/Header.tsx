import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/routes/paths";
import { SvgArrowFullLeft, SvgArrowFullRight, SvgBell, SvgMenu } from "../common/Icons";
import { MainButton } from "../common/MainButton";
import { LanguageDropdown } from "../common/LanguageDropdown";
import { fetchCurrentUser } from "@/api/users";
import { clearToken, getToken } from "@/api/auth";
import type { User } from "@/types";
import i18n from "@/locales/i18n";

type HeaderProps = {
  variant: "public" | "app" | "back";
};

export function Header({ variant }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (variant === "app" && getToken()) {
      fetchCurrentUser()
        .then((data) => {
          setUser(data)
          if (data.language) {
            i18n.changeLanguage(data.language.toLowerCase());
          }
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, [variant]);

  const displayName = user?.name ?? t('header.guest');
  const displayInitial = displayName.charAt(0).toUpperCase();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    const element = document.getElementById(targetId);
    if (!element) return;

    if (targetId === 'preview') {
      const offset = 40;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (variant === "public") {
    return (
      <header className="main-header-public">
        <div className="header-container">
          <Link to={ROUTES.home} className="header-logo">
            <span className="logo">wishly</span>
          </Link>
          <nav className="header-nav">
            <ul>
              <li>
                <a href="#about-us" onClick={(e) => handleScroll(e, 'about-us')}>{t('header.nav.aboutUs')}</a>
              </li>
              <li>
                <a href="#hiw" onClick={(e) => handleScroll(e, 'hiw')}>{t('header.nav.howItWorks')}</a>
              </li>
              <li>
                <a href="#wcu" onClick={(e) => handleScroll(e, 'wcu')}>{t('header.nav.advantages')}</a>
              </li>
              <li>
                <a href="#preview" onClick={(e) => handleScroll(e, 'preview')}>{t('header.nav.preview')}</a>
              </li>
            </ul>
          </nav>
          <div className="header-right">
            <LanguageDropdown />

            <div className="account-menu" aria-label="Public navigation">
              <Link to={ROUTES.signIn} className="sign-in">{t('header.auth.logIn')}</Link>
              <Link to={ROUTES.signUp} className="log-in">{t('header.auth.signUp')}</Link>
            </div>
          </div>
        </div>
      </header>
    );
  }
  if (variant === "back") {
    return (
      <header className="main-header">
        <div className="header-container">
          <Link to={ROUTES.home} className="header-logo">
            <span className="logo">wishly</span>
          </Link>
          <nav className="header-nav"></nav>
          <div className="header-right">
            <button onClick={() => navigate(-1)}
              className="back-btn"
              style={{ background: 'transparent', border: 'none', color: 'var(--color-white)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <SvgArrowFullLeft /> <span className="backText">{t('header.back')}</span>
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <Link to={ROUTES.home} className="header-logo">
            <span className="logo">wishly</span>
          </Link>
          <nav className="header-nav"></nav>
          <div className="header-right">
            <Link to={ROUTES.profile} className="user">
              <span className="user-name">{displayName}</span>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="user-avatar"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="user-avatar">{displayInitial}</div>
              )}
            </Link>

            <Link to={ROUTES.notifications} className="notification-btn" aria-label="Notifications">
              <SvgBell />
            </Link>

            <div className={`menu-btn ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <SvgMenu />
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="burger-menu-overlay" onClick={closeMenu}>
            <div className="burger-menu-content" onClick={(e) => e.stopPropagation()}>
              <nav className="burger-nav-list">
                <Link
                  to={ROUTES.wishlists}
                  className={`burger-nav-item ${location.pathname.includes(ROUTES.wishlists) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{t('header.burger.wishlist')}</span>
                  <SvgArrowFullRight />
                </Link>
                <Link
                  to={ROUTES.sharedWishes}
                  className={`burger-nav-item ${location.pathname.includes(ROUTES.sharedWishes) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{t('header.burger.shared')}</span>
                  <SvgArrowFullRight />
                </Link>
                <Link
                  to={ROUTES.reservation}
                  className={`burger-nav-item ${location.pathname.includes(ROUTES.reservation) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{t('header.burger.reservations')}</span>
                  <SvgArrowFullRight />
                </Link>

                <div className="burger-divider"></div>

                <Link
                  to={ROUTES.profile}
                  className={`burger-nav-item ${location.pathname.includes(ROUTES.profile) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{t('header.burger.profile')}</span>
                  <SvgArrowFullRight />
                </Link>
                <Link
                  to={ROUTES.settings}
                  className={`burger-nav-item ${location.pathname.includes(ROUTES.settings) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{t('header.burger.settings')}</span>
                  <SvgArrowFullRight />
                </Link>
              </nav>

              <div className="burger-footer">
                <LanguageDropdown color="var(--color-black)" />

                <div className="burger-user-info">
                  <Link
                    to={ROUTES.profile}
                    onClick={closeMenu}
                    className="burger-user-info"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="user-avatar"
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="user-avatar">{displayInitial}</div>
                    )}
                    <span className="user-name-dark">{displayName}</span>
                  </Link>
                </div>

                <MainButton
                  text={t('header.burger.signOut')}
                  backgroundColor='var(--color-black)'
                  hoverColor="var(--color-black-hover)"
                  textColor='var(--color-white)'
                  onClick={() => {
                    clearToken();
                    closeMenu();
                    navigate(ROUTES.signIn);
                  }}
                  icon={<SvgArrowFullRight />}
                  iconPosition="after"
                />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}