import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Code, Mail, Target, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const { t, i18n } = useTranslation();

  // 🔥 Local direction ONLY for this page
  const isRTL = i18n.language === "he";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <Helmet>
        <title>{t("about_title")}</title>
        <meta name="description" content={t("about_description")} />
      </Helmet>

      <PageContainer maxWidth="4xl">

        {/* Our Story */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">{t("about_our_story_title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t("about_story_paragraph1")}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about_story_paragraph2")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">{t("about_our_mission_title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t("about_mission_paragraph")}
                </p>

                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{t("about_mission_point1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{t("about_mission_point2")}</span>
                  </li>
                  {/* <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{t("about_mission_point3")}</span>
                  </li> */}
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{t("about_mission_point4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why We Exist */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">{t("about_why_exist_title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t("about_why_paragraph1")}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about_why_paragraph2")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">{t("about_values_title")}</h2>
            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-primary">🎯</span> Accessibility
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("about_values_accessibility")}
                </p>
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-primary">🤝</span> Collaboration
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("about_values_collaboration")}
                </p>
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-primary">💪</span> Empowerment
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("about_values_empowerment")}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Join Us */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <Code className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold mb-2">{t("about_join_us_title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about_join_description")}
              </p>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Link to="/ContactUs">
                <Button size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  {t("get_in_touch")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </PageContainer>
    </div>
  );
};

export default About;
