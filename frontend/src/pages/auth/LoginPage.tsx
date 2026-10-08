import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SignInTopbar } from "@/components/auth/SignInTopbar";
import { SignInForm } from "@/components/auth/SignInForm";
import styles from "./LoginPage.module.css";
import lightGradient from '@/assets/images/light-gradient.png';
import { ROUTES } from "@/routes/paths";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <img src={lightGradient} className={styles.authBgGradientTop} alt="" aria-hidden="true"></img>
      <SignInTopbar />
      <div className={styles.pageWrapper}>

        <section className={styles.leftContent}>
          <h1 className={styles.headline}>
            {t('auth.signUpTitle')} <span className={styles.brand}>Wishly</span>
          </h1>
          <p className={styles.subline}>
            {t('auth.alreadyHaveAccount')}&nbsp;{" "}
            <Link to={ROUTES.signIn}>{t('auth.logInLink')}</Link>
          </p>
        </section>

        <section className={styles.rightPanel} aria-label={t('auth.loginFormAria')}>
          <div className={styles.formCard}>
            <SignInForm
              submitLabel={t('auth.signUpSubmit')}
              mode="register"
              onSuccess={() => navigate(ROUTES.wishlists, { replace: true })}
            />
          </div>
        </section>
      </div>
    </>
  );
}