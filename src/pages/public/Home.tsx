import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Book, HelpCircle, Type, Puzzle, BookOpen, Users, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import { useAuthContext } from "@/context/AuthContext";

const features = [
	{
		nameKey: "feature_dictionary",
		path: "/Dictionary",
		descriptionKey: "feature_dictionary_desc",
		icon: BookOpen,
		color: "from-indigo-500 to-indigo-300",
	},
	{
		nameKey: "feature_quiz",
		path: "/Quiz",
		descriptionKey: "feature_quiz_desc",
		icon: HelpCircle,
		color: "from-blue-500 to-blue-300",
	},
	{
		nameKey: "feature_game",
		path: "/MatchingGame",
		descriptionKey: "feature_game_desc",
		icon: Puzzle,
		color: "from-yellow-500 to-yellow-300",
	},
	{
		nameKey: "feature_typing_practice", // new feature
		path: "#", // coming soon
		descriptionKey: "feature_typing_practice_desc", // new i18n key
		icon: Type,
		color: "from-green-500 to-green-300",
	},
];

const Home = () => {
	const { t } = useTranslation();
	const { user } = useAuthContext();
	useMedicalTerms();

	return (
		<>
			<Helmet>
				<title>{t("home_title")}</title>
			</Helmet>

			<main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
				{/* Features Section */}
				<section className="mb-16 md:mb-20">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={feature.nameKey}
									whileHover={{ scale: 1.03, y: -5 }}
									whileTap={{ scale: 0.98 }}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
								>
									<Link to={feature.path}>
										<Card className="relative h-full overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur">
											{/* Coming Soon badge for Typing Practice */}
											{feature.nameKey === "feature_typing_practice" && (
												<div className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded font-semibold text-white z-20">
													{t("coming_soon", "Coming Soon")}
												</div>
											)}

											<div className={`h-40 flex items-center justify-center bg-gradient-to-br ${feature.color} relative overflow-hidden`}>
												<div className="absolute inset-0 bg-black/5" />
												<Icon size={56} className="relative z-10 text-white drop-shadow-lg" />
											</div>
											<CardHeader className="space-y-3">
												<CardTitle className="text-xl">{t(feature.nameKey)}</CardTitle>
												<CardDescription className="text-base leading-relaxed">
													{t(feature.descriptionKey)}
												</CardDescription>
											</CardHeader>
										</Card>
									</Link>
								</motion.div>
							);
						})}
					</div>
				</section>
			</main>
		</>
	);
};

export default Home;
