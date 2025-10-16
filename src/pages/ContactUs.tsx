import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Helmet } from "react-helmet-async";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

import { MessageSquare, Bug, Languages, Handshake } from "lucide-react";

const MAX_MESSAGE_CHARS = 1500; // client-side limit to prevent overly long submissions
const GENERIC_ERROR = "Sorry, something went wrong. Please try again later.";

const ContactUs = () => {
  // Get user from context
  const { user, profile } = useAuthContext();

  // Contact fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Telegram messaging state
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(user?.email || "");
    } else if (user) {
      const meta = user.user_metadata || {};
      const likelyName = meta.full_name || meta.name || "";
      setName(likelyName || "");
      setEmail(user.email || "");
    }
  }, [user, profile]);

  // Optional: prefill a template if navigated with a query param like ?type=bug
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (!type) return;

    if (type === "bug" && !message) {
      setMessage(
        [
          "Bug report:",
          "- App area/page:",
          "- Steps to reproduce:",
          "- Expected result:",
          "- Actual result:",
          "- Browser/OS:",
          "- Screenshot link (optional):",
        ].join("\n")
      );
    } else if (type === "translation" && !message) {
      setMessage(
        [
          "Translation issue:",
          "- Language:",
          "- Phrase/word:",
          "- Current translation:",
          "- Suggested correction:",
          "- Context (where it appears):",
        ].join("\n")
      );
    } else if (type === "collab" && !message) {
      setMessage(
        [
          "Collaboration request:",
          "- Your role/background:",
          "- How you’d like to work together:",
          "- Availability/timezone:",
          "- Links (portfolio/GitHub/LinkedIn):",
        ].join("\n")
      );
    }
  }, [message]);

  function clampMessage(input: string) {
    // Enforce max length while typing
    return input.slice(0, MAX_MESSAGE_CHARS);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const trimmed = message.trim();

      if (!trimmed) {
        setResult({ ok: false, error: "Please enter a message." });
        return;
      }

      if (trimmed.length > MAX_MESSAGE_CHARS) {
        setResult({ ok: false, error: `Message is too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.` });
        return;
      }

      // If user is anonymous, encourage providing a reply email
      if (!user && !email.trim()) {
        setResult({ ok: false, error: "Please include a reply email so a response can be sent." });
        return;
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();
      const textLines = [
        "📨 New contact message",
        `Date: ${dateStr} Time: ${timeStr}`,
        user
          ? `User: ${user.email || "unknown"} (${user.id})`
          : "User: anonymous",
        profile ? `Profile: ${profile.full_name || "-"}, ${profile.specialization || "-"}, ${profile.hospital || "-"}` : null,
        `Name: ${name?.trim() || "-"}`,
        `Email: ${email?.trim() || "-"}`,
        "-----",
        trimmed,
      ].filter(Boolean);
      const textToSend = textLines.join("\n");

      const resp = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });

      // Always provide user-friendly feedback; avoid exposing backend debug details
      if (resp.ok) {
        setResult({ ok: true });
        // Keep name/email for continuity; clear only the message
        setMessage("");
      } else {
        // Optionally log internally without surfacing to user
        try {
          const data = await resp.json();
          // console.error("Contact send failed:", data); // keep disabled or behind a dev flag
        } catch {
          // ignore parse errors
        }
        setResult({ ok: false, error: GENERIC_ERROR });
      }
    } catch {
      setResult({ ok: false, error: GENERIC_ERROR });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us</title>
      </Helmet>

      <div className="container mx-auto max-w-3xl py-8 space-y-6">
        {/* Page intro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Found a bug, noticed a translation issue, or want to collaborate? Send a message and include a reply address so a response can be sent back quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Bug className="h-4 w-4" />
                  Report a bug
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Include steps to reproduce, expected vs actual behavior, and your browser/OS.
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Languages className="h-4 w-4" />
                  Translation issue
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share the language, exact phrase, where it appears, and your suggested correction.
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Handshake className="h-4 w-4" />
                  Work together
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tell a bit about your background and how you’d like to collaborate.
                </p>
              </div>
            </div>

            <Separator />

            {/* Submission form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 120))}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Reply email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, 254))}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Just send a message</Label>
                <Textarea
                  id="message"
                  placeholder={profile?.full_name ? `Write your message here, ${profile.full_name}...` : user?.user_metadata?.full_name ? `Write your message here, ${user.user_metadata.full_name}...` : "Write your message here..."}
                  value={message}
                  onChange={(e) => setMessage(clampMessage(e.target.value))}
                  rows={8}
                  required
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    If not signed in, include your email so a reply can be sent.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {message.length}/{MAX_MESSAGE_CHARS}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={sending || !message.trim()}>
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>

              {result?.ok && (
                <Alert>
                  <AlertDescription>Message sent successfully!</AlertDescription>
                </Alert>
              )}
              {result?.ok === false && (
                <Alert variant="destructive">
                  <AlertDescription>{result.error || GENERIC_ERROR}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Thanks for helping improve the app—every report and suggestion makes a difference for learners and collaborators.
        </p>
      </div>
    </>
  );
};

export default ContactUs;
