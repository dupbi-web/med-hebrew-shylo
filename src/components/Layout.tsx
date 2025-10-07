import Navbar from "@/components/Navbar"; // adjust path if needed
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:py-8">
        <Outlet />
      </main>
      <footer className="w-full bg-card border-t py-6 px-4 text-center text-muted-foreground mt-8 shadow-inner">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-sm">© {new Date().getFullYear()} Doctor Hebrew. All rights reserved.</span>
          <span className="text-sm">Made with <span className="text-red-500">♥</span> by Nick-Dev-Ops</span>
        </div>
      </footer>
    </>
  );
};

export default Layout;
