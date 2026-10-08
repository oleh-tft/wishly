import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import { useTranslation } from "react-i18next";
import '../styles/notfound.css'
import { SvgArrowFullLeft } from "@/components/common/Icons";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="page-not-found-wrap">
      <header className="wishlistdescription-header">
        <div className="wishlistdescription-header-container">
          <Link to={ROUTES.home} className="wishlistdescription-logo">wishly</Link>
        </div>
      </header>
      <div className="page-not-found-container">
        <h1 className="page-not-found-title">{t('notFound.title')}</h1>
        <p className="page-not-found-text">{t('notFound.text')}</p>
        <Link to="/wishlists" className="page-not-found-button-back">
          <SvgArrowFullLeft />
          {t('notFound.back')}
        </Link>
      </div>
    </div>
  );
}