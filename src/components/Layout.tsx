import Navbar from "@/components/Navbar"; // adjust path if needed
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-6">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
