import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function PublicLayout() {
  return (
    <>
      <Header variant="public" />
      <main className="layout-landing">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
