import { Post } from "../../components/post/Post";
import { NewPost } from "../../components/post/NewPost";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useAlerts } from "../../context/AlertContext";
import postService from "../../service/postService";

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    document.title = 'Trang cá nhân';
    if (user && user.id) {
      (async () => {
      try {
        const response = await postService.getPostusers(user.id);
        console.log(response);
        setPosts(response.data);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
        addAlert(
          {
            type: "error",
            message: error.response?.data?.message || "Đã có lỗi xảy ra khi tải bài viết.",
          }
        );
      }
    })();
    }
  }, [user]);

  return (
    <>
      <NewPost />
      {posts.map((post, index) => (
        <Post key={index} post={post} />
      ))}
    </>
  );
};
