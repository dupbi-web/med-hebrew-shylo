// import React, { useEffect } from 'react';
// import MedicalSentences from '@/components/MedicalSentences';

// const MedicalSentencesPage: React.FC = () => {
//   useEffect(() => {
//     document.title = "משפטים רפואיים לרופאים — SpeakMed Hebrew";

//     const description =
//       "משפטים רפואיים מקצועיים לרופאים לפי קטגוריות - לשכנוע התחלת טיפול, הסברת חומרה, שינוי אורח חיים ועוד. תמיכה בעברית, אנגלית ורוסית.";

//     let metaDescription = document.querySelector('meta[name="description"]');
//     if (!metaDescription) {
//       metaDescription = document.createElement('meta');
//       metaDescription.setAttribute('name', 'description');
//       document.head.appendChild(metaDescription);
//     }
//     metaDescription.setAttribute('content', description);

//     let metaKeywords = document.querySelector('meta[name="keywords"]');
//     if (!metaKeywords) {
//       metaKeywords = document.createElement('meta');
//       metaKeywords.setAttribute('name', 'keywords');
//       document.head.appendChild(metaKeywords);
//     }
//     metaKeywords.setAttribute(
//       'content',
//       'משפטים רפואיים, רופאים, טיפול רפואי, שיחה עם מטופלים, עברית רפואית, רוסית רפואית'
//     );

//     const structuredData = {
//       "@context": "https://schema.org",
//       "@type": "WebApplication",
//       name: "משפטים רפואיים לרופאים",
//       description,
//       applicationCategory: "Medical",
//       operatingSystem: "Web",
//       offers: {
//         "@type": "Offer",
//         price: "0",
//         priceCurrency: "USD",
//       },
//       featureList: [
//         "משפטים לפי קטגוריות רפואיות",
//         "תמיכה בשלוש שפות",
//         "העתקה מהירה של משפטים",
//         "דוגמאות לשיחה",
//         "ממשק ידידותי לנייד",
//       ],
//     };

//     let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
//     if (!structuredDataScript) {
//       structuredDataScript = document.createElement('script');
//       structuredDataScript.setAttribute('type', 'application/ld+json');
//       document.head.appendChild(structuredDataScript);
//     }
//     structuredDataScript.textContent = JSON.stringify(structuredData);

//     // Cleanup is optional here
//   }, []);

//   return <MedicalSentences />;
// };

// export default MedicalSentencesPage;
import React from "react";
import { Helmet } from "react-helmet-async";
import MedicalSentences from "@/components/MedicalSentences";

const MedicalSentencesPage: React.FC = () => {
  const description =
    "משפטים רפואיים מקצועיים לרופאים לפי קטגוריות - לשכנוע התחלת טיפול, הסברת חומרה, שינוי אורח חיים ועוד. תמיכה בעברית, אנגלית ורוסית.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "משפטים רפואיים לרופאים",
    description,
    applicationCategory: "Medical",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "משפטים לפי קטגוריות רפואיות",
      "תמיכה בשלוש שפות",
      "העתקה מהירה של משפטים",
      "דוגמאות לשיחה",
      "ממשק ידידותי לנייד",
    ],
  };

  return (
    <>
      <Helmet>
        <title>משפטים רפואיים לרופאים — SpeakMed Hebrew</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="משפטים רפואיים, רופאים, טיפול רפואי, שיחה עם מטופלים, עברית רפואית, רוסית רפואית"
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <MedicalSentences />
    </>
  );
};

export default MedicalSentencesPage;
