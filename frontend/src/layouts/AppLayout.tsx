import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  return (
    <>
      <Header variant="app" />
      <main>
        <div className="dashboard-layout">
          <Sidebar />
          <div className="dashboard-content">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
