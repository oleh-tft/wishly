import { ROUTES } from "@/routes/paths";
import { Link } from "react-router-dom";

export function Footer() {
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="landing-footer">
        <div className="footer-wrap">
            <Link to={ROUTES.home} onClick={scrollToTop}>wishly</Link>
            <span className="footer-copyright">© 2026 Wishly Inc.</span>
        </div>
    </footer>
  );
}
