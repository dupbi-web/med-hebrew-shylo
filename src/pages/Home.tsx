import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Book, HelpCircle, Type, Puzzle, IdCard, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMedicalTermsWithCategories } from "@/cache/medicalTermsCache"; // cache של מילים עם קטגוריות
import { useEffect } from "react";

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
];

const Home = () => {
	const { t } = useTranslation();

	useEffect(() => {
		// Preload medical terms with categories when Home mounts
		getMedicalTermsWithCategories();
	}, []);

	return (
		<>
			<Helmet>
				<title>{t("home_title")}</title>
			</Helmet>

			<main className="container mx-auto max-w-6xl px-4 py-10">
				{/* 1️⃣ Заголовок / Hero Section */}
				<header className="text-center mb-12">
					<motion.h1
						className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						{t("home_title")}
					</motion.h1>
					<motion.p
						className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
					>
						{t("home_description")}
					</motion.p>
					<div className="mt-6 flex justify-center gap-4">
						<Link to="/Dictionary">
							<button className="px-6 py-3 dark:bg-gray-500 rounded-lg hover:bg-primary/50 transition">
								{t("view_dictionary")}
							</button>
						</Link>
						<Link to="/MatchingGame">
							<button className="px-6 py-3 bg-secondary dark:text-white rounded-lg dark:hover:bg-secondary/80 transition">
								{t("nav_matching_game")}
							</button>
						</Link>
					</div>
				</header>

				{/* 2️⃣ Краткое объяснение сайта */}
				<section className="mb-12 text-center">
					<h2 className="text-2xl font-semibold mb-4">{t("home_what_can_do")}</h2>
					<p className="text-gray-600 dark:text-gray-300 mb-2">{t("home_learn_words")}</p>
					<p className="text-gray-600 dark:text-gray-300">{t("home_practice_games")}</p>
				</section>

				{/* 3️⃣ Кнопки / CTA с пояснением */}
				<section className="mb-12 text-center">
					<h2 className="text-2xl font-semibold mb-4">{t("home_choose_method")}</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={feature.nameKey}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.97 }}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.1, duration: 0.4 }}
								>
									<Link to={feature.path}>
										<Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
											<div
												className={`h-32 flex items-center justify-center bg-gradient-to-br ${feature.color} text-white`}
											>
												<Icon size={48} />
											</div>
											<CardHeader>
												<CardTitle>{t(feature.nameKey)}</CardTitle>
												<CardDescription>{t(feature.descriptionKey)}</CardDescription>
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
