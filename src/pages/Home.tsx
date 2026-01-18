import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Book, HelpCircle, Type, Puzzle, IdCard, BookOpen, Sparkles, Users, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import { useAuthContext } from "@/context/AuthContext";

const features = [
	{
	  nameKey: "feature_typing_practice",
	  path: "/typing-game", 
	  descriptionKey: "feature_typing_practice_desc",
	  icon: Type,
	  color: "from-green-400 to-green-200",
	},
	{
		nameKey: "feature_flash_cards",
		path: "/flash-cards",
		descriptionKey: "feature_flash_cards_desc",
		icon: IdCard,
		color: "from-pink-500 to-pink-300",
	},
	{
	nameKey: "learning",
	path: "/learning",
	descriptionKey: "feature_learning_desc",
	icon: Sparkles,
	color: "from-purple-500 to-purple-300",
	},
	{
	  nameKey: "feature_dictionary",
	  path: "/Dictionary",
	  descriptionKey: "feature_dictionary_desc",
	  icon: BookOpen,
	  color: "from-indigo-600 to-indigo-400",
	},

	{
	  nameKey: "feature_quiz",
	  path: "/Quiz",
	  descriptionKey: "feature_quiz_desc",
	  icon: HelpCircle,
	  color: "from-blue-600 to-blue-400",
	},
	{
	  nameKey: "feature_game",
	  path: "/matching-game",
	  descriptionKey: "feature_game_desc",
	  icon: Puzzle,
	  color: "from-yellow-400 to-yellow-200",
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
				{/* Hero Section with Registration CTA */}
				<section className="text-center mb-16 md:mb-20">
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="space-y-6"
					>
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
							{t("home_title")}
						</h1>

						<p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
							{t("home_description")}
						</p>

						{!user ? (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
							>
								<Link to="/auth">
									<Button size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
										{t("get_started_free", "Get Started Free")}
									</Button>
								</Link>
								<Link to="/public-quiz">
									<Button size="lg" variant="outline" className="text-base px-8 py-6">
										{t("try_quiz", "Try Quiz")}
									</Button>
								</Link>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
							>
								<Link to="/Learning">
									<Button size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
										{t("continue_learning", "Continue Learning")}
									</Button>
								</Link>
								<Link to="/matching-game">
									<Button size="lg" variant="outline" className="text-base px-8 py-6">
										{t("play_game", "Play Game")}
									</Button>
								</Link>
							</motion.div>
						)}

						{/* Social Proof */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
						>
							<div className="flex items-center gap-2">
								<Users className="h-5 w-5 text-primary" />
								<span>{t("join_learners", "Join learners worldwide")}</span>
							</div>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-primary" />
								<span>{t("improve_skills", "Improve your skills")}</span>
							</div>
						</motion.div>
					</motion.div>

					{/* Telegram Channel Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className="mt-12 text-center"
					>
						<h2 className="text-2xl md:text-3xl font-bold mb-4">
							{t("telegram_waiting_list", "Join the Weekly Sentences Telegram Channel")}
						</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
							{t(
								"telegram_waiting_list_desc",
								"Get exclusive access to weekly curated sentences to boost your language skills. Limited spots available."
							)}
						</p>
						{user ? (
							<Button
								size="lg"
								className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all bg-[#0088cc] text-white"
								onClick={() => window.open("https://t.me/+LTqZ-SnyElI0NGFk", "_blank")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M9.999 15.17 9.88 18.32c.257 0 .368-.11.502-.243l2.406-2.305 4.988 3.63c.914.504 1.566.24 1.807-.85l3.273-15.36.002-.002c.29-1.35-.49-1.88-1.373-1.55L1.64 9.35C.31 9.87.318 10.63 1.41 10.96l5.61 1.75 13.04-8.23c.61-.36 1.17-.16.71.23" />
								</svg>
								{t("telegram_join_now", "Telegram")}
							</Button>
						) : (
							<Link to="/auth">
								<Button
									size="lg"
									className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all bg-[#0088cc] text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M9.999 15.17 9.88 18.32c.257 0 .368-.11.502-.243l2.406-2.305 4.988 3.63c.914.504 1.566.24 1.807-.85l3.273-15.36.002-.002c.29-1.35-.49-1.88-1.373-1.55L1.64 9.35C.31 9.87.318 10.63 1.41 10.96l5.61 1.75 13.04-8.23c.61-.36 1.17-.16.71.23" />
									</svg>
									{t("telegram_join_now", "Join Telegram")}
								</Button>
							</Link>
						)}
					</motion.div>
				</section>

				{/* Benefits Section */}
				<section className="mb-16 md:mb-20">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="text-center mb-12"
					>
						<h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
							{t("home_what_can_do")}
						</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							{t("home_comprehensive_learning", "A comprehensive platform to master medical Hebrew through interactive learning")}
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							const isComingSoon = feature.path === "#";
							return (
								<motion.div
									key={feature.nameKey}
									whileHover={{ scale: 1.02, y: -8 }}
									whileTap={{ scale: 0.98 }}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
									className="h-full"
								>
									<Link 
										to={feature.path}
										className={isComingSoon ? "pointer-events-none" : ""}
									>
										<Card className="relative h-full overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur-sm group cursor-pointer">
											{/* Coming Soon Badge */}
											{isComingSoon && (
												<div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs px-3 py-1.5 rounded-full font-semibold text-white z-20 shadow-lg animate-pulse">
													{t("coming_soon", "Coming Soon")}
												</div>
											)}
											
											{/* Icon Header with Enhanced Gradient */}
											<div className={`h-32 flex items-center justify-center bg-gradient-to-br ${feature.color} relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
												{/* Animated background pattern */}
												<div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
												<div className="absolute inset-0 opacity-20">
													<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
												</div>
												<Icon 
													size={64} 
													className="relative z-10 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" 
												/>
											</div>
											
											{/* Content */}
											<CardHeader className="space-y-3 p-6">
												<CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
													{t(feature.nameKey)}
												</CardTitle>
												<CardDescription className="text-base leading-relaxed text-muted-foreground">
													{t(feature.descriptionKey)}
												</CardDescription>
												
												{/* Hover indicator */}
												{!isComingSoon && (
													<div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
														<span className="text-sm font-medium">Explore →</span>
													</div>
												)}
											</CardHeader>
											
											{/* Decorative corner accent */}
											<div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-tl-full`} />
										</Card>
									</Link>
								</motion.div>
							);
						})}
					</div>
				</section>

				{/* Final CTA Section */}
				{!user && (
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
					>
						<p className="text-muted-foreground mb-6 max-w-xl mx-auto">
							{t("join_today", "Join today and get access to all learning materials, games, and personalized progress tracking")}
						</p>
						<Link to="/auth">
							<Button size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
								{t("create_free_account", "Create Free Account")}
							</Button>
						</Link>
					</motion.section>
				)}
			</main>
		</>
	);
};

export default Home;
