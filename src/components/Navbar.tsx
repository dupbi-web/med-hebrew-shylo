import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const games = [
  { name: "Home", path: "/" },
  { name: "Flash Cards", path: "/FlashCards" },
  { name: "Quiz", path: "/Quiz" },
  { name: "Typing Game", path: "/TypingGame" },
  { name: "Matching Game", path: "/MatchingGame" },
  { name: "Learning", path: "/Learning" },
  { name: "Contact Us", path: "/ContactUs" },
];

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className="mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Medical Hebrew Hub
        </h1>

        {/* Desktop Nav and Theme Toggle */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex space-x-6">
            {games.map((game) => (
              <Link
                key={game.path}
                to={game.path}
                className={`font-semibold transition-colors duration-200 ${
                  location.pathname === game.path
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {game.name}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 backdrop-blur border-t px-6 pb-4">
          <nav className="flex flex-col space-y-4">
            {games.map((game) => (
              <Link
                key={game.path}
                to={game.path}
                onClick={closeMenu}
                className={`font-semibold transition-colors duration-200 ${
                  location.pathname === game.path
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {game.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
