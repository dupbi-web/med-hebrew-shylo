// import { useTranslation } from "react-i18next";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// const langs = [
//   { code: "he", label: "עברית" },
//   { code: "en", label: "English" },
//   { code: "ru", label: "Русский" },
// ];

// const LanguageSwitcher = () => {
//   const { i18n } = useTranslation();
//   return (
//     <div className="w-25">
//       <Select
//         value={i18n.language}
//         onValueChange={(lang) => i18n.changeLanguage(lang)}
//       >
//         <SelectTrigger className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary">
//           <SelectValue placeholder="Select language" />
//         </SelectTrigger>
//         <SelectContent>
//           {langs.map((lang) => (
//             <SelectItem key={lang.code} value={lang.code}>
//               {lang.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

// export default LanguageSwitcher;
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  setLanguagePreference,
  getLanguagePreference,
} from "@/cache/medicalTermsCache"

const langs = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    getLanguagePreference().then((savedLang) => {
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
        setCurrentLang(savedLang);
      }
    });
  }, []);

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await setLanguagePreference(lang);
    setCurrentLang(lang);
  };

  return (
    <div className="w-25">
      <Select
        value={currentLang}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {langs.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
