import { Outlet } from "react-router";
import { Header } from "../components/profile/Header";
import { Menu } from "../components/profile/Menu";


export const ProfileLayout = () => {
  return (
    <div className="md:mt-4 md:mx-auto md:w-[80%] min-h-screen">
        <Header />
        <Menu />
        <Outlet/>
    </div>
  );
}