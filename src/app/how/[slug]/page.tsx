import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppScreenshot } from "@/components/content/app-screenshot";
import { RichText } from "@/components/content/rich-text";
import { buttonVariants } from "@/components/ui/button";
import { appContent, sourceUrl } from "@/content/apps";

export function generateStaticParams() {
  return appContent.map((a) => ({ slug: a.slug }));
}

const find = (slug: string) => appContent.find((a) => a.slug === slug);

export async function generateMetadata({ params }: PageProps<"/how/[slug]">): Promise<Metadata> {
  const app = find((await params).slug);
  return app ? { title: `How ${app.name} is built`, description: app.how.intro } : {};
}

export default async function HowItsBuiltPage({ params }: PageProps<"/how/[slug]">) {
  const app = find((await params).slug);
  if (!app) notFound();

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-10 px-4 py-12">
      <header className="grid gap-4">
        <Link href="/#work" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" /> All work
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">How {app.name} is built</h1>
        <p className="text-lg text-pretty text-muted-foreground">{app.how.intro}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={app.href} className={buttonVariants()}>
            Try {app.name}
          </Link>
          <a href={sourceUrl(`src/app/(apps)/${app.slug}`)} className={buttonVariants({ variant: "outline" })} rel="noopener noreferrer" target="_blank">
            Source code <ExternalLinkIcon />
          </a>
        </div>
      </header>

      <AppScreenshot slug={app.slug} alt={`${app.name} screenshot`} priority />

      {app.how.sections.map((section) => (
        <section key={section.title} className="grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
          {section.body.map((p) => (
            <p key={p} className="leading-7 text-pretty">
              <RichText text={p} />
            </p>
          ))}
          {section.source && (
            <a href={sourceUrl(section.source)} className="flex w-fit items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" rel="noopener noreferrer" target="_blank">
              View the code <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
        </section>
      ))}

      <section className="grid gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">How it&apos;s tested</h2>
        <ul className="grid list-disc gap-1.5 pl-5">
          {app.how.tests.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">What I&apos;d build next</h2>
        <ul className="grid list-disc gap-1.5 pl-5">
          {app.how.next.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
