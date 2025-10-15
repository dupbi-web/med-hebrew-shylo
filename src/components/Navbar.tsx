import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X, LogOut, User } from "lucide-react";

type NavItem = { nameKey: string; path: string };

const navItems: NavItem[] = [
  { nameKey: "nav_home", path: "/" },
  { nameKey: "nav_learning", path: "/Learning" },
  { nameKey: "nav_quiz", path: "/Quiz" },
  { nameKey: "nav_matching_game", path: "/MatchingGame" },
  { nameKey: "nav_dictionary", path: "/Dictionary" },
  { nameKey: "nav_contactUs", path: "/ContactUs" },
];

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 items-center justify-between px-3 sm:px-4">
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="font-semibold tracking-tight hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
            onClick={closeMenu}
            aria-label="Home"
          >
            MED-IVRIT
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={[
                "rounded px-3 py-2 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                isActive(item.path)
                  ? "text-primary font-medium bg-primary/10"
                  : "hover:text-foreground"
              ].join(" ")}
            >
              {t(item.nameKey)}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/Profile"
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={closeMenu}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Button variant="ghost" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </div>
          ) : (
            <Link to="/Auth" onClick={closeMenu}>
              <Button className="text-sm">Sign in</Button>
            </Link>
          )}
        </div>

        {/* Mobile: Menu toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={toggleMenu}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={[
          "md:hidden border-t bg-background transition-[max-height] duration-300 overflow-hidden text-right",
          isMobileMenuOpen ? "max-h-[80vh]" : "max-h-0"
        ].join(" ")}
      >
        <nav className="mx-auto max-w-7xl px-3 sm:px-4 py-3 flex flex-col gap-1">
			          {/* Mobile actions */}
          <div className="flex items-center justify-between gap-2 py-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={[
                "rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                isActive(item.path)
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              ].join(" ")}
            >
              {t(item.nameKey)}
            </Link>
          ))}

          <div className="my-2 border-t" />



          {user ? (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/Profile"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Button variant="ghost" className="justify-start gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </div>
          ) : (
            <Link to="/Auth" onClick={closeMenu} className="pt-1">
              <Button className="w-full text-sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
