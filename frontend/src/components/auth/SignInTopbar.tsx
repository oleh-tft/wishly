import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./SignInTopbar.module.css";
import { LanguageDropdown } from "../common/LanguageDropdown";
import { SvgArrowFullLeft } from "../common/Icons";

type SignInTopbarProps = {
  backHref?: string;
};

export function SignInTopbar({ backHref = "/" }: SignInTopbarProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarWrap}>
        <Link to="/" className={styles.topbar__logo}>
          wishly
        </Link>

        <div className={styles.topbar__right}>
          <LanguageDropdown color="var(--color-white)" />
          <Link to={backHref} className={styles.topbar__backLink}>
            <SvgArrowFullLeft />
            <span className={styles.backText}>{t('auth.back')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}