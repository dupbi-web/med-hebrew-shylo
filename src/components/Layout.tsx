import Navbar from "@/components/Navbar"; // adjust path if needed
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
