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

  return (
    <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-bold tracking-tight">Game Hub</h1>
        <nav className="space-x-6">
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
    </header>
  );
};

export default Navbar;
