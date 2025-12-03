import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'
import { QueryProvider } from './providers/QueryProvider'
import "./i18n"; // import i18n config
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ThemeProvider>
  </QueryProvider>
)
