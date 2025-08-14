// import { Link, useLocation } from "react-router-dom";

// const games = [
//   { name: "Home", path: "/" },
//   { name: "Flash Cards", path: "/FlashCards" },
//   { name: "Quiz", path: "/Quiz" },
//   { name: "Typing Game", path: "/TypingGame" },
//   { name: "Matching Game", path: "/MatchingGame" },
// ];

// const Navbar = () => {
//   const location = useLocation();

//   return (
//     <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
//       <div className="container mx-auto flex justify-between items-center py-4 px-6">
//         <h1 className="text-2xl font-bold tracking-tight">Game Hub</h1>
//         <nav className="space-x-6">
//           {games.map((game) => (
//             <Link
//               key={game.path}
//               to={game.path}
//               className={`font-semibold transition-colors duration-200 ${
//                 location.pathname === game.path
//                   ? "text-yellow-300"
//                   : "hover:text-yellow-200"
//               }`}
//             >
//               {game.name}
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const games = [
  { name: "Home", path: "/" },
  { name: "Flash Cards", path: "/FlashCards" },
  { name: "Quiz", path: "/Quiz" },
  { name: "Typing Game", path: "/TypingGame" },
  { name: "Matching Game", path: "/MatchingGame" },
];

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-tight">Game Hub</h1>

        {/* Hamburger Menu Button (visible on mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none focus:ring-2 focus:ring-yellow-300"
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          {games.map((game) => (
            <Link
              key={game.path}
              to={game.path}
              className={`font-semibold transition-colors duration-200 ${
                location.pathname === game.path
                  ? "text-yellow-300"
                  : "hover:text-yellow-200"
              }`}
            >
              {game.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-700 px-6 pb-4">
          <nav className="flex flex-col space-y-4">
            {games.map((game) => (
              <Link
                key={game.path}
                to={game.path}
                onClick={closeMenu}
                className={`font-semibold transition-colors duration-200 ${
                  location.pathname === game.path
                    ? "text-yellow-300"
                    : "hover:text-yellow-200"
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
