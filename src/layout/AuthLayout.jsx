export const AuthLayout = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        hello from AuthLayout
        <Outlet />
      </div>
    </div>
  );
}   