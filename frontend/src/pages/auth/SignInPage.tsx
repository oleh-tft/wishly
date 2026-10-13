import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SignInTopbar } from "@/components/auth/SignInTopbar";
import { SignInForm } from "@/components/auth/SignInForm";
import styles from "./SignInPage.module.css";
import lightGradient from '@/assets/images/light-gradient.png';
import { ROUTES } from "@/routes/paths";
import giftBox from '@/assets/images/gift-box-with-ribbon.png';

export function SignInPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <img src={lightGradient} className={styles.authBgGradientTop} alt="" aria-hidden="true"></img>
      <div className={styles.presentsWrapper}>
        <img src={giftBox} className={`${styles.present} ${styles.presentTr}`} alt="present" />
        <img src={giftBox} className={`${styles.present} ${styles.presentBl}`} alt="present" />
        <img src={giftBox} className={`${styles.present} ${styles.presentBm}`} alt="present" />
      </div>
      <SignInTopbar />
      <div className={styles.pageWrapper}>

        <section className={styles.leftContent}>
          <h1 className={styles.headline}>
            {t('auth.logInTitle')} <span className={styles.brand}>Wishly</span>
          </h1>
          <p className={styles.subline}>
            {t('auth.dontHaveAccount')}&nbsp;{" "}
            <Link to={ROUTES.signUp}>{t('auth.signUpLink')}</Link>
          </p>
        </section>

        <section className={styles.rightPanel} aria-label={t('auth.loginFormAria')}>
          <div className={styles.formCard}>
            <SignInForm
              submitLabel={t('auth.logInSubmit')}
              mode="login"
              onSuccess={() => navigate(ROUTES.wishlists, { replace: true })}
            />
          </div>
        </section>
      </div>
    </>
  );
}