import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { login, register } from "@/api/auth";
import styles from "./SignInForm.module.css";
import { MainButton } from "../common/MainButton";
import { SvgArrowFullRight, SvgGoogle, SvgWarning } from "../common/Icons";

type GoogleSetupInfo = {
  redirect_uris: string[];
  console_url: string;
  note: string;
};

type SignInFormProps = {
  /** Label for the primary submit button. Defaults to "Sign in" */
  submitLabel?: string;
  /** "login" — only email+password; "register" — name+email+password */
  mode?: "login" | "register";
  /** Called after a successful login/register (e.g. to navigate away) */
  onSuccess?: () => void;
};

/**
 * Auth form: email, password with toggle, remember-me checkbox,
 * submit button, and Google social button.
 * Shared by both SignInPage and LoginPage.
 */
export function SignInForm({
  submitLabel,
  mode = "login",
  onSuccess,
}: SignInFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleSetup, setGoogleSetup] = useState<GoogleSetupInfo | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  /** Regex: Latin letters, spaces, hyphens, apostrophes only */
  const NAME_PATTERN = /^[A-Za-z\s\-']+$/;
  const NAME_MAX = 50;
  /**
   * Email pattern rules:
   * - standard local@domain.tld structure
   * - domain must be ASCII-only: letters, digits, hyphens, dots
   *   (rejects Cyrillic, Thai, and any other non-Latin script)
   * - first domain label must contain at least one ASCII letter
   *   (rejects purely numeric domains like 1.com or 123.net)
   */
  const EMAIL_PATTERN =
    /^[^\s@]+@(?:[a-zA-Z0-9\-]*[a-zA-Z][a-zA-Z0-9\-]*)(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,}$/;
  const EMAIL_MIN = 6; // shortest plausible address: a@b.co
  const EMAIL_MAX = 254;
  const PASSWORD_MIN = 8;
  const PASSWORD_MAX = 50;

  function validateForm(
    name: string | null,
    email: string,
    password: string,
  ): boolean {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (mode === "register" && name !== null) {
      if (name.length === 0) {
        errors.name = t('auth.form.errors.nameRequired');
      } else if (name.length > NAME_MAX) {
        errors.name = t('auth.form.errors.nameMax', { max: NAME_MAX });
      } else if (!NAME_PATTERN.test(name)) {
        errors.name = t('auth.form.errors.namePattern');
      }
    }

    if (email.length === 0) {
      errors.email = t('auth.form.errors.emailRequired');
    } else if (email.length > EMAIL_MAX) {
      errors.email = t('auth.form.errors.emailMax', { max: EMAIL_MAX });
    } else {
      const atIdx = email.indexOf("@");
      const domain = atIdx !== -1 ? email.slice(atIdx + 1) : "";
      const domainIsAscii = /^[\x00-\x7F]+$/.test(domain);
      if (!domainIsAscii || email.length < EMAIL_MIN || !EMAIL_PATTERN.test(email)) {
        errors.email = t('auth.form.errors.emailInvalid');
      }
    }

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      errors.password = t('auth.form.errors.passwordLength', { min: PASSWORD_MIN, max: PASSWORD_MAX });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const apiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const googleAvailable = !!apiUrl;

  useEffect(() => {
    if (!googleAvailable) return;

    fetch(`${apiUrl}/api/auth/google/setup`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.redirect_uris) && data.redirect_uris.length > 0) {
          setGoogleSetup(data as GoogleSetupInfo);
        }
      })
      .catch(() => { });
  }, [apiUrl, googleAvailable]);

  const handleGoogleSignIn = () => {
    if (!googleAvailable) return;
    window.location.href = `${apiUrl}/api/auth/google/start`;
  };

  const redirectUri = googleSetup?.redirect_uris?.[0];
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const rememberMe = (form.get("remember") as string) === "on";
    const name = mode === "register" ? (form.get("name") as string) : null;

    if (!validateForm(name, email, password)) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        await register(name!, email, password);
      } else {
        await login(email, password, rememberMe);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.form.errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  const currentSubmitLabel = submitLabel || t('auth.form.signIn');

  return (
    <form
      className={styles.form}
      action="#"
      method="post"
      noValidate
      onSubmit={handleSubmit}
      aria-label={t('auth.form.aria.form')}
    >
      {error && (
        <div className={styles.errorMessage} role="alert">
          <SvgWarning /><span>{error}</span>
        </div>
      )}

      {mode === "register" && (
        <div
          className={`${styles.inputGroup} ${styles.inputWithLeftIcon}${fieldErrors.name ? ` ${styles.inputInvalid}` : ""
            }`}
        >
          <div className={styles.inputField}>
            <span className={styles.inputIcon} aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#bbb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              id="name"
              name="name"
              placeholder={t('auth.form.namePlaceholder')}
              autoComplete="name"
              aria-label={t('auth.form.aria.name')}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              aria-invalid={!!fieldErrors.name}
              required
            />
          </div>
          {fieldErrors.name && (
            <p id="name-error" className={styles.fieldError} role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>
      )}

      <div
        className={`${styles.inputGroup} ${styles.inputWithLeftIcon}${fieldErrors.email ? ` ${styles.inputInvalid}` : ""
          }`}
      >
        <div className={styles.inputField}>
          <span className={styles.inputIcon} aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#bbb"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <polyline points="2,4 12,13 22,4" />
            </svg>
          </span>
          <input
            type="text"
            inputMode="email"
            id="email"
            name="email"
            placeholder={t('auth.form.emailPlaceholder')}
            autoComplete="email"
            aria-label={t('auth.form.aria.email')}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={!!fieldErrors.email}
            required
          />
        </div>
        {fieldErrors.email && (
          <p id="email-error" className={styles.fieldError} role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div
        className={`${styles.inputGroup} ${styles.inputPassword}${fieldErrors.password ? ` ${styles.inputInvalid}` : ""
          }`}
      >
        <div className={styles.inputField}>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder={t('auth.form.passwordPlaceholder')}
            autoComplete="current-password"
            aria-label={t('auth.form.aria.password')}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            aria-invalid={!!fieldErrors.password}
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            aria-label={showPassword ? t('auth.form.aria.hidePassword') : t('auth.form.aria.showPassword')}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#bbb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#bbb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="password-error" className={styles.fieldError} role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {mode === "login" && (
        <div className={styles.rememberRow}>
          <input type="checkbox" id="remember" name="remember" />
          <label htmlFor="remember">{t('auth.form.rememberMe')}</label>
        </div>
      )}

      <MainButton
        type="submit"
        text={loading ? t('auth.form.loading') : currentSubmitLabel}
        backgroundColor="var(--color-pink)"
        style={{ width: "100%" }}
        icon={<SvgArrowFullRight />}
        iconPosition="after"
        disabled={loading}
      />
    </form>
  );
}