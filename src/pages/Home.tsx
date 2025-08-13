import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";



const Home = () => {
  return (
    <>
      <Helmet>
        <title>Game Hub</title>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Welcome to the Game Hub
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Choose your challenge and improve your skills. Learn, play, and compete!
          </p>
        </header>

        <footer className="mt-16 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Game Hub. All rights reserved.
        </footer>
      </main>
    </>
  );
};

export default Home;
