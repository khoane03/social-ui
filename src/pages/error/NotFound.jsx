import { Link } from "react-router";
import { FileX2 } from "lucide-react";

const NotFound = () => {
  return (
    <div className="w-screen h-screen fixed flex items-center justify-center bg-gradient-to-br from-[#FAFAFB] to-[#E5ECFC] px-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-4 rounded-full">
            <FileX2 className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">404 - Không tìm thấy trang</h1>
        <p className="text-gray-600 mb-6">
          Oops! Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
