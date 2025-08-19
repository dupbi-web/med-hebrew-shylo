// import { Link } from "react-router-dom";
// import { Helmet } from "react-helmet-async";
// import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { motion } from "framer-motion";
// import { Gamepad2, Book, HelpCircle, Type, Puzzle, IdCard, BookOpen } from "lucide-react";

// const games = [
//     {
//     name: "Learning Process",
//     path: "/Learning",
//     description: "Engage in educational challenges to enhance your skills.",
//     icon: Book,
//     color: "from-purple-500 to-purple-300",
//   },
//   {
//     name: "Flash Cards",
//     path: "/FlashCards",
//     description: "Memorize and learn faster with interactive flashcards.",
//     icon: IdCard,
//     color: "from-pink-500 to-pink-300",
//   },
//   {
//     name: "Quiz",
//     path: "/Quiz",
//     description: "Test your knowledge with fun quizzes.",
//     icon: HelpCircle,
//     color: "from-blue-500 to-blue-300",
//   },
//   {
//     name: "Typing Game",
//     path: "/TypingGame",
//     description: "Improve your typing speed and accuracy.",
//     icon: Type,
//     color: "from-green-500 to-green-300",
//   },
//   {
//     name: "Matching Game",
//     path: "/MatchingGame",
//     description: "Match cards as fast as you can!",
//     icon: Puzzle,
//     color: "from-yellow-500 to-yellow-300",
//   },
//   {
//     name: "Dictionary",
//     path: "/Dictionary",
//     description: "Browse and search all medical terms.",
//     icon: BookOpen,
//     color: "from-indigo-500 to-indigo-300",
//   },
// ];

// const Home = () => {
//   return (
//     <>
//       <Helmet>
//         <title>Game Hub</title>
//       </Helmet>

//       <main className="container mx-auto max-w-6xl px-4 py-10">
//         {/* Header */}
//         <header className="text-center mb-12">
//           <motion.h1
//             className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             Welcome to the Game Hub
//           </motion.h1>
//           <motion.p
//             className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//           >
//             Choose your challenge and improve your skills. Learn, play, and compete!
//           </motion.p>
//         </header>

//         {/* Game Grid */}
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {games.map((game, index) => {
//             const Icon = game.icon;
//             return (
//               <motion.div
//                 key={game.path}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.97 }}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1, duration: 0.4 }}
//               >
//                 <Link to={game.path}>
//                   <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
//                     <div
//                       className={`h-32 flex items-center justify-center bg-gradient-to-br ${game.color} text-white`}
//                     >
//                       <Icon size={48} />
//                     </div>
//                     <CardHeader>
//                       <CardTitle>{game.name}</CardTitle>
//                       <CardDescription>{game.description}</CardDescription>
//                     </CardHeader>
//                   </Card>
//                 </Link>
//               </motion.div>
//             );
//           })}
//         </section>

//         {/* Footer */}
//         <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
//           &copy; {new Date().getFullYear()} Game Hub. All rights reserved.
//         </footer>
//       </main>
//     </>
//   );
// };

// export default Home;
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Book, HelpCircle, Type, Puzzle, IdCard, BookOpen } from "lucide-react";

const features = [
  {
    name: "Словарь",
    path: "/Dictionary",
    description: "Полный доступ ко всем словам и категориям",
    icon: BookOpen,
    color: "from-indigo-500 to-indigo-300",
  },
  {
    name: "Tест",
    path: "/Quiz",
    description: "Проверяйте свои знания",
    icon: HelpCircle,
    color: "from-blue-500 to-blue-300",
  },
  {
    name: "Игры",
    path: "/MatchingGame",
    description: "Активное и увлекательное обучение",
    icon: Puzzle,
    color: "from-yellow-500 to-yellow-300",
  },
];


const Home = () => {
  return (
    <>
      <Helmet>
        <title>Учите иврит просто и понятно</title>
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
            Учите иврит просто и понятно – специально для врачей и новых иммигрантов
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Этот сайт поможет вам выучить важные слова и выражения на иврите, понять медицинскую и повседневную лексику и практиковаться интересно и эффективно.
          </motion.p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/Dictionary">
              <button className="px-6 py-3 dark:bg-gray-500 rounded-lg hover:bg-primary/50 transition">
                Посмотреть словарь
              </button>
            </Link>
            <Link to="/Learning">
              <button className="px-6 py-3 bg-secondary dark:text-white rounded-lg dark:hover:bg-secondary/80 transition">
                Начать учить
              </button>
            </Link>
          </div>
        </header>

        {/* 2️⃣ Краткое объяснение сайта */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Что можно делать на сайте?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Изучать важные слова на иврите с переводом на русский и английский.</p>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Принимать участие в форуме вопросов и ответов – как по медицинским, так и по бытовым темам.</p>
          <p className="text-gray-600 dark:text-gray-300">Практиковать иврит через игры и викторины для закрепления знаний.</p>
        </section>

        {/* 3️⃣ Кнопки / CTA с пояснением */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Выберите способ изучения:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link to={feature.path}>
                    <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
                      <div className={`h-32 flex items-center justify-center bg-gradient-to-br ${feature.color} text-white`}>
                        <Icon size={48} />
                      </div>
                      <CardHeader>
                        <CardTitle>{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
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
