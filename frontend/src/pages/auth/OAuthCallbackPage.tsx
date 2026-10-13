import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { oauthLogin } from "@/api/auth";
import { ROUTES } from "@/routes/paths";
import styles from "./OAuthCallbackPage.module.css";

interface OAuthCallbackPageProps {
  provider: "google";
}

/** Human-readable labels per provider */
const PROVIDER_LABEL: Record<OAuthCallbackPageProps["provider"], string> = {
  google: "Google",
};

function getGoogleRedirectUri(): string {
  const frontendUrl = (
    import.meta.env.VITE_FRONTEND_URL || window.location.origin
  ).replace(/\/$/, "");
  return (
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    `${frontendUrl}/auth/google/callback`
  );
}

/**
 * Maps OAuth error codes to friendly messages.
 */
function getFriendlyError(code: string | null, provider: OAuthCallbackPageProps["provider"]): string {
  switch (code) {
    case "access_denied":
      return "Access was denied. If you're testing this app, make sure your Google account has been added as a test user in the Google Cloud Console (APIs & Services → OAuth consent screen → Test users). Then try again.";
    case "invalid_request":
      return "The sign-in request was invalid. Please try again.";
    case "invalid_client":
      return "OAuth configuration error. Please contact support.";
    case "temporarily_unavailable":
      return `${PROVIDER_LABEL[provider]} sign-in is temporarily unavailable. Please try again later.`;
    case "missing_code":
      return "Sign-in was not completed. Click “Sign in with Google” on the sign-in page — do not open this URL directly.";
    case "state_mismatch":
      return "Security check failed. Please try signing in again.";
    case "redirect_uri_mismatch":
      return `Add this redirect URI in Google Cloud Console: ${getGoogleRedirectUri()}`;
    case "origin_mismatch":
      return `Add this redirect URI in Google Cloud Console: ${getGoogleRedirectUri()}`;
    default:
      return code
        ? `Authentication failed: ${code}. Please try again.`
        : "An unknown error occurred. Please try again.";
  }
}

function readAccessTokenFromHash(): string | null {
  const match = window.location.hash.match(/^#access_token=(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function OAuthCallbackPage({ provider }: OAuthCallbackPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const callbackError = searchParams.get("error");
    const state = searchParams.get("state");
    const code = searchParams.get("code");
    const accessToken = readAccessTokenFromHash();

    if (callbackError) {
      const friendlyMessage = getFriendlyError(callbackError, provider);
      setError(friendlyMessage);
      console.error(`[OAuth] ${provider} callback error:`, callbackError);
      return;
    }

    const savedState = sessionStorage.getItem("oauth_state");
    if (state && savedState && state !== savedState) {
      setError("Security check failed (state mismatch). Please try signing in again.");
      console.error("[OAuth] State mismatch — possible CSRF attempt.");
      return;
    }
    if (savedState) {
      sessionStorage.removeItem("oauth_state");
    }

    if (accessToken) {
      localStorage.setItem("token", accessToken);
      navigate(ROUTES.profile, { replace: true });
      return;
    }

    if (!code) {
      setError(getFriendlyError("missing_code", provider));
      console.error(`[OAuth] ${provider} callback missing code.`);
      return;
    }

    async function exchangeToken() {
      try {
        await oauthLogin(provider, code!, state || undefined, getGoogleRedirectUri());
        navigate(ROUTES.profile, { replace: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to authenticate. Please try again.";
        setError(message);
        console.error(`[OAuth] ${provider} token exchange error:`, err);
      }
    }

    exchangeToken();
  }, [searchParams, provider, navigate]);

  const providerLabel = PROVIDER_LABEL[provider];

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.errorBox} role="alert">
          <h2>Sign-in Failed</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.btnGroup}>
            <button onClick={() => navigate(ROUTES.signIn, { replace: true })} className={styles.btnRetry}>
              Back to Sign in
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} aria-hidden="true"></div>
          <p>Signing in with {providerLabel}…</p>
        </div>
      )}
    </div>
  );
}
