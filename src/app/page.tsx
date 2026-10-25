import { ArrowRightIcon, BriefcaseIcon, CalendarClockIcon, CompassIcon } from "lucide-react";
import Link from "next/link";
import { AppScreenshot } from "@/components/content/app-screenshot";
import { howItsBuiltHref } from "@/components/shell/nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { appContent, platformFacts, repo } from "@/content/apps";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

const firstName = profile.name.split(" ")[0];

const paths = [
  {
    icon: BriefcaseIcon,
    title: "Hiring?",
    body: "See how I build: three apps, the decisions behind them, and the tests.",
    href: "#work",
    cta: "See the work",
  },
  {
    icon: CalendarClockIcon,
    title: "Need something built?",
    body: `Book a call through the scheduler I built.`,
    href: `/meet/${profile.bookingHandle}`,
    cta: "Book a call",
  },
  {
    icon: CompassIcon,
    title: "Just exploring?",
    body: "Every app works without an account. Jump in.",
    href: "#work",
    cta: "Try the apps",
  },
];

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-24 px-4 py-12 sm:py-20">
      <section aria-labelledby="hero-title" className="grid gap-10">
        <div className="grid max-w-3xl gap-4">
          <p className="text-sm font-medium text-muted-foreground">{profile.role}</p>
          <h1 id="hero-title" className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Hi, I&apos;m {firstName}.
          </h1>
          <p className="text-xl text-pretty text-muted-foreground">{profile.pitch}</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {paths.map((p) => (
            <li key={p.title}>
              <Link
                href={p.href}
                className="group flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <p.icon className="size-5 text-muted-foreground" aria-hidden />
                <span className="font-medium">{p.title}</span>
                <span className="text-sm text-muted-foreground">{p.body}</span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium">
                  {p.cta} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="work" aria-labelledby="work-title" className="grid scroll-mt-24 gap-16">
        <div className="grid gap-2">
          <h2 id="work-title" className="text-3xl font-semibold tracking-tight">
            The work
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Three full apps on one stack: Next.js 16, React 19, Postgres and TypeScript. Each has a write-up of the
            decisions behind it.
          </p>
        </div>
        {appContent.map((app, i) => (
          <article key={app.slug} className="grid items-center gap-8 lg:grid-cols-[3fr_2fr]">
            <Link href={app.href} className={cn("block", i % 2 === 1 && "lg:order-last")} tabIndex={-1} aria-hidden>
              <AppScreenshot slug={app.slug} alt="" priority={i === 0} className="transition-shadow hover:shadow-md" />
            </Link>
            <div className="grid gap-4">
              <h3 className="text-2xl font-semibold tracking-tight">{app.name}</h3>
              <p className="text-muted-foreground">{app.tagline}</p>
              <ul className="grid gap-2 text-sm">
                {app.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/60" />
                    {h}
                  </li>
                ))}
              </ul>
              <ul aria-label="Built with" className="flex flex-wrap gap-1.5">
                {app.stack.map((s) => (
                  <li key={s}>
                    <Badge variant="secondary">{s}</Badge>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href={app.href} className={buttonVariants()}>
                  Open {app.name}
                </Link>
                <Link href={howItsBuiltHref(app.slug)} className={buttonVariants({ variant: "outline" })}>
                  How it&apos;s built
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="principles-title" className="grid gap-6">
        <h2 id="principles-title" className="text-3xl font-semibold tracking-tight">
          How I build
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformFacts.map((f) => (
            <li key={f.title} className="rounded-xl border p-5">
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="about" aria-labelledby="about-title" className="grid scroll-mt-24 gap-6 lg:grid-cols-[2fr_3fr]">
        <h2 id="about-title" className="text-3xl font-semibold tracking-tight">
          About me
        </h2>
        <div className="grid gap-4">
          {profile.about.map((p) => (
            <p key={p} className="text-pretty">
              {p}
            </p>
          ))}
          {profile.location && <p className="text-muted-foreground">{profile.location}</p>}
          <ul aria-label="Skills" className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <li key={s}>
                <Badge variant="outline">{s}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="grid scroll-mt-24 gap-4 rounded-2xl border p-8 text-center">
        <h2 id="contact-title" className="text-3xl font-semibold tracking-tight">
          Let&apos;s talk
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Hiring, a project, or an idea worth building? Pick a time that works for you.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/meet/${profile.bookingHandle}`} className={buttonVariants({ size: "lg" })}>
            <CalendarClockIcon /> Book a call
          </Link>
          <a href={profile.links.github} className={buttonVariants({ variant: "outline", size: "lg" })} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          {profile.links.linkedin && (
            <a href={profile.links.linkedin} className={buttonVariants({ variant: "outline", size: "lg" })} rel="noopener noreferrer" target="_blank">
              LinkedIn
            </a>
          )}
        </div>
        {profile.links.email && (
          <p className="text-sm text-muted-foreground">
            Or email <a href={`mailto:${profile.links.email}`} className="underline underline-offset-4">{profile.links.email}</a>
          </p>
        )}
      </section>

      <footer className="flex flex-wrap justify-between gap-2 border-t pt-6 text-sm text-muted-foreground">
        <p>Built with Next.js 16, React 19, Postgres and TypeScript. Runs on free tiers.</p>
        <a href={repo.url} className="underline underline-offset-4" rel="noopener noreferrer" target="_blank">
          Source on GitHub
        </a>
      </footer>
    </main>
  );
}
