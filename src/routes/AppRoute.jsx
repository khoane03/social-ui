import { BrowserRouter, Route, Routes, useLocation } from "react-router";
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
import ModalUpdateProfile from "../components/auth/ModalUpdateProfile";
import { RequestManagerPage } from "../pages/dashboard/RequestManagerPage";
import { PostPage } from "../pages/home/Post";
import ForgotPassword from "../pages/auth/ForgotPassword";
import AllFriend from "../components/friend/AllFriend";
import PostPending from "../pages/dashboard/PostPending";
import LoginAdminPage from "../pages/dashboard/LoginAdminPage";


const AppRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoute role="ROLE_USER"/>}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="friend" element={<FriendPage />} >
              <Route path=":tab" element={<FriendPage />} />
            </Route>
            <Route path="settings" element={<SettingPage />} />
            <Route path="profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path=":id" element={<ProfilePage />} />
              <Route path=":id/friend" element={<AllFriend />} />
              <Route path=":id/images" element={<Image />} />
              <Route path=":id/info" element={<Info />} />
            </Route>
            <Route path="required-update-profile" element={<ModalUpdateProfile />} />
            <Route path="post/:id" element={<PostPage />} />
          </Route>
          <Route path="/message" element={<MessageLayout />}>
            <Route index element={<MessagePage />} />
            <Route path=":id" element={<MessagePage />} />
          </Route>
        </Route>
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
          <Route path="register" element={<SignUpPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        <Route path="/dashboard/auth" element={<LoginAdminPage />} />
        <Route element={<PrivateRoute role="ROLE_ADMIN" redirectTo="/dashboard/auth" />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="account" element={<AccountManagerPage />} />
            <Route path="post" element={<PostManagerPage />} />
            <Route path="post-pending" element={<PostPending />} />
            <Route path="info" element={<AdminProfilePage />} />
            <Route path="request" element={<RequestManagerPage />} />
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
