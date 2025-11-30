import { Sidebar } from "../components/sidebar/Sidebar";
import { Outlet } from "react-router";

export const MainLayout = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black text-white-theme overflow-hidden">
      <Sidebar />
      <div className="absolute top-0 right-0 bottom-0 left-[80px] md:left-[320px] overflow-x-hidden overflow-y-auto scroll-smooth dark:bg-black text-white-theme ">
        <Outlet />
      </div>
    </div>
  );
};
