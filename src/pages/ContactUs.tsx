import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, Coffee, Mail, Github, Heart, Send } from "lucide-react";

const ContactUs = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const resp = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.trim() })
      });

      const data = await resp.json();

      if (resp.ok) {
        setResult({ ok: true });
        setMessage("");
      } else {
        const errText =
          typeof data?.description === "string"
            ? data.description
            : typeof data?.error === "string"
            ? data.error
            : "Failed to send message";
        setResult({ ok: false, error: errText });
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Network error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us - Medical Hebrew Hub</title>
        <meta
          name="description"
          content="Get in touch with the Medical Hebrew Hub team and support our project."
        />
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <motion.header
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you! Get in touch or support our project.
          </p>
        </motion.header>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Get in Touch</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Have questions, suggestions, or feedback? We'd love to hear from you.
                </p>
                <Button asChild className="w-full">
                  <a href="mailto:contact@medicalhebrew.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* GitHub Star */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <CardTitle>Star Our Project</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Love what we're building? Give us a star on GitHub and help others discover our project!
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href="https://github.com/yourusername/medical-hebrew-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Star on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Telegram Message */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Send a Telegram Message</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message for the team..."
                    className="w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    maxLength={4000}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Sent securely via our Edge Function.
                    </p>
                    <Button
                      type="submit"
                      className="min-w-[140px]"
                      disabled={sending || !message.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>

                {result?.ok && (
                  <p className="mt-3 text-sm text-green-600">
                    Message sent successfully!
                  </p>
                )}
                {result?.ok === false && (
                  <p className="mt-3 text-sm text-red-600">
                    {result.error || "Failed to send message."}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Coffee className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-2xl">Support Our Work</CardTitle>
              </div>
              <p className="text-muted-foreground">
                If you find our Medical Hebrew learning tools helpful, consider buying us a coffee!
                Your support helps us maintain and improve the platform.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
                <a
                  href="https://buymeacoffee.com/medicalhebrew"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Buy Me a Coffee
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
                Made with <Heart className="h-4 w-4 text-red-500" fill="currentColor" /> for Hebrew learners
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-muted-foreground">
            Medical Hebrew Hub is an open-source project dedicated to helping medical professionals
            learn Hebrew terminology through interactive games and exercises.
          </p>
        </motion.div>
      </main>
    </>
  );
};

export default ContactUs;
