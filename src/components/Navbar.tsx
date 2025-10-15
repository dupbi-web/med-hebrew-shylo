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
	const { t } = useTranslation(); // <-- Add this

	const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
	const closeMenu = () => setIsMobileMenuOpen(false);

	return (
		<header className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
			<div className="mx-auto flex items-center justify-between py-4 px-6">
				{/* Logo */}
				<h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
					<Link to="/">
						MED-IVRIT
					</Link>			
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
								{t(game.nameKey)}
							</Link>
						))}
					</nav>
					<div className="flex items-center gap-3">
						<ThemeToggle />
						<LanguageSwitcher />
						{user ? (
							<>
								<Link to="/profile">
									<Button variant="outline" size="sm" className="flex items-center gap-2">
										<User className="h-4 w-4" />
										Profile
									</Button>
								</Link>
								<Button
									variant="outline"
									size="sm"
									onClick={signOut}
									className="flex items-center gap-2"
								>
									<LogOut className="h-4 w-4" />
									Logout
								</Button>
							</>
						) : (
							<Link to="/auth">
								<Button variant="outline" size="sm" className="flex items-center gap-2">
									<User className="h-4 w-4" />
									Login
								</Button>
							</Link>
						)}
					</div>
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden flex items-center gap-2">
					<ThemeToggle />
					<LanguageSwitcher />
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
								{t(game.nameKey)}
							</Link>
						))}
						<div className="pt-4 border-t">
							{user ? (
								<>
									<Link to="/profile" onClick={closeMenu} className="block mb-2">
										<Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
											<User className="h-4 w-4" />
											Profile
										</Button>
									</Link>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											signOut();
											closeMenu();
										}}
										className="w-full flex items-center justify-center gap-2"
									>
										<LogOut className="h-4 w-4" />
										Logout
									</Button>
								</>
							) : (
								<Link to="/auth" onClick={closeMenu}>
									<Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
										<User className="h-4 w-4" />
										Login
									</Button>
								</Link>
							)}
						</div>
					</nav>
				</div>
			)}
		</header>
	);
};

export default Navbar;
