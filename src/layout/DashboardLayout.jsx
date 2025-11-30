import { Outlet } from "react-router";
import { Menu } from "../components/admin/Menu";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-[#384A71] overflow-hidden">
      <Menu />
      <div className="flex-1 ml-64 overflow-y-auto scroll-smooth">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};