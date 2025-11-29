import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import {
  MessageSquare,
  Bug,
  Languages,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

const MAX_MESSAGE_CHARS = 1500;

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const bugTemplate = t("contact_template_bug");
  const translationTemplate = t("contact_template_translation");
  const featureTemplate = t("contact_template_feature");
  const collaborationTemplate = t("contact_template_collab");

  // Prefill template based on URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (!type || message) return;

    const templates: Record<string, string> = {
      bug: bugTemplate,
      translation: translationTemplate,
      feature: featureTemplate,
      collab: collaborationTemplate,
    };

    if (templates[type]) {
      setMessage(templates[type]);
    }
  }, [bugTemplate, translationTemplate, featureTemplate, collaborationTemplate, message]);

  function clampMessage(input: string) {
    return input.slice(0, MAX_MESSAGE_CHARS);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setSuccess(false);
    setError("");

    try {
      const trimmed = message.trim();

      if (!trimmed) {
        setError(t("contact_error_no_message"));
        return;
      }

      if (trimmed.length > MAX_MESSAGE_CHARS) {
        setError(t("contact_error_too_long", { max: MAX_MESSAGE_CHARS }));
        return;
      }

      if (!email.trim()) {
        setError(t("contact_error_need_email"));
        return;
      }

      const now = new Date();
      const payload = [
        "📨 New contact message asdadasd",
        `Date: ${now.toLocaleDateString()} Time: ${now.toLocaleTimeString()}`,
        `Name: ${name || "-"}`,
        `Email: ${email || "-"}`,
        "-----",
        trimmed,
      ].join("\n");

      const resp = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload }),
      });

      if (resp.ok) {
        setSuccess(true);
        setMessage("");
      } else {
        setError(t("contact_error_generic"));
      }
    } catch {
      setError(t("contact_error_generic"));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{t("contact_title")} - Med-Ivrit</title>
        <meta name="description" content={t("contact_meta")} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {t("contact_title")}
            </CardTitle>

            <div className="text-center text-sm text-muted-foreground mt-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{t("contact_response_time")}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Why Contact Us Section */}
            <div className="bg-secondary/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-center">{t("contact_why_title")}</h3>
              <p className="text-sm text-muted-foreground text-center">{t("contact_why_text")}</p>
            </div>

            {/* Template Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-medium">{t("contact_what_help")}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMessage(bugTemplate)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-red-500 hover:bg-red-500/5"
                >
                  <Bug className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-medium">{t("contact_bug")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMessage(translationTemplate)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-blue-500 hover:bg-blue-500/5"
                >
                  <Languages className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium">{t("contact_translation")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMessage(featureTemplate)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-green-500 hover:bg-green-500/5"
                >
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-medium">{t("contact_feature")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMessage(collaborationTemplate)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-purple-500 hover:bg-purple-500/5"
                >
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-xs font-medium">{t("contact_collaborate")}</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact_name_label")}</Label>
                  <Input
                    id="name"
                    placeholder={t("contact_name_label")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact_email_label")} <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("contact_email_label")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact_message_label")} *</Label>
                <Textarea
                  id="message"
                  placeholder={t("contact_message_placeholder")}
                  value={message}
                  onChange={(e) => setMessage(clampMessage(e.target.value))}
                  rows={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("contact_be_detailed")}</span>
                  <span>{message.length}/{MAX_MESSAGE_CHARS}</span>
                </div>
              </div>

              <Button type="submit" disabled={sending || !email.trim() || !message.trim()} className="w-full" size="lg">
                {sending ? t("contact_sending") : t("contact_send")}
              </Button>
            </form>

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle>{t("contact_success_title")}</AlertTitle>
                <AlertDescription>{t("contact_success_desc")}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle>{t("contact_error_title")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContactUs;
