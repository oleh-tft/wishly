import { RouterProvider, useLocation } from "react-router-dom";
import { router } from "@/routes";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { fetchCurrentUser } from "./api/users";
import { getToken } from "./api/auth";

export function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const initLanguage = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const user = await fetchCurrentUser();
        if (user.language) {
          i18n.changeLanguage(user.language.toLowerCase());
        }
      } catch (err) {
        console.log("User not logged in or session expired");
      }
    };

    initLanguage();
  }, [i18n]);

  return <RouterProvider router={router} />;
}