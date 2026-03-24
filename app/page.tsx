import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Link2, BarChart3, Zap, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Shortener — Shorten, Share & Track Your Links",
  description:
    "Turn long URLs into short, shareable links in seconds. Track clicks and manage all your links in one place.",
};

const features = [
  {
    icon: Link2,
    title: "Shorten Any URL",
    description:
      "Paste any long URL and get a clean, compact link you can share anywhere in seconds.",
  },
  {
    icon: BarChart3,
    title: "Track Every Click",
    description:
      "Monitor click counts for each of your links and understand how your audience engages with your content.",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Redirects",
    description:
      "Our globally distributed infrastructure ensures your short links resolve with minimal latency every time.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your links are tied to your account. Only you can view, edit, or delete them.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Shorten, Share & Track Your Links
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Turn any long URL into a clean, shareable link in seconds. Monitor
          click analytics and manage all your links from a single dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button size="lg">Get Started Free</Button>
          </SignUpButton>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Features */}
      <section
        aria-labelledby="features-heading"
        className="w-full max-w-5xl px-4 pb-24"
      >
        <h2
          id="features-heading"
          className="mb-10 text-center text-2xl font-semibold tracking-tight"
        >
          Everything you need to manage your links
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="mb-2 size-6 text-primary" aria-hidden="true" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
