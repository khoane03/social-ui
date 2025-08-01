import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "../pages/error/NotFound";
import PrivateRoute from "./PrivateRoute";
import { HomePage } from "../pages/home/HomePage";
import { MainLayout, AuthLayout, ProfileLayout } from "../layout";
import { SettingPage } from "../pages/setting/SettingPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { Info } from "../components/profile/Info";
import { MessageLayout } from "../layout/MessageLayout";
import { MessagePage } from "../pages/message/MessagePage";
import { FriendPage } from "../pages/friends/FriendPage";
import { Image } from "../components/profile/Image";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignUpPage } from "../pages/auth/SignUp";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewPage } from "../pages/dashboard/OverviewPage";
import { AdminProfilePage } from "../pages/dashboard/AdminProfilePage";
import { AccountManagerPage } from "../pages/dashboard/AccountManagerPage";
import { PostManagerPage } from "../pages/dashboard/PostManagerPage";
import { RoleManagerPage } from "../pages/dashboard/RoleManagerPage";
import { NoPermission } from "../pages/error/NoPermisstion";

const AppRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="friends" element={<FriendPage />} />"
            <Route path="settings" element={<SettingPage />} />
            <Route path="profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="friends" element={<FriendPage />} />
              <Route path="images" element={<Image />} />
              <Route path="info" element={<Info />} />
            </Route>
          </Route>
          <Route path="/message" element={<MessageLayout />}>
            <Route index element={<MessagePage />} />
            <Route path=":id" element={<MessagePage />} />
          </Route>
        </Route>
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
          <Route path="register" element={<SignUpPage />} />
        </Route>

        <Route element={<PrivateRoute onlyAdmin redirectTo="/no-permission" />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="account" element={<AccountManagerPage />} />
            <Route path="post" element={<PostManagerPage />} />
            <Route path="info" element={<AdminProfilePage />} />
            <Route path="add-role" element={<RoleManagerPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="no-permission" element={<NoPermission />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;
