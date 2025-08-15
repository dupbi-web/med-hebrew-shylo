import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}


// import { Moon, Sun } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useTheme } from "@/components/ThemeProvider";

// export function ThemeToggle() {
//   const { theme, setTheme } = useTheme();

//   const toggleTheme = () => {
//     setTheme(theme === "light" ? "dark" : "light");
//   };

//   return (
//     <Button
//       variant="ghost"
//       size="icon"
//       onClick={toggleTheme}
//       className="relative flex items-center justify-center text-primary-foreground"
//     >
//       <Sun
//         className="h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out
//                    rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
//       />
//       <Moon
//         className="h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out
//                    absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100"
//       />
//       <span className="sr-only">Toggle theme</span>
//     </Button>
//   );
// }
