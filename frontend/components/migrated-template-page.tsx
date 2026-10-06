import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BookOpenText, CircleHelp, Code2, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
import { migratedPages, type MigratedPage } from "@/lib/migrated-template-data";
import { PlaygroundRunner, StatusProbe, SupportDesk } from "@/components/migration-widgets";

function SourceContent({ page }: { page: MigratedPage }) {
  if (!page.html) return <p className="muted-copy">The original template contains state-driven content that is supplied by the connected backend.</p>;
  return <div className="migrated-template-copy" dangerouslySetInnerHTML={{ __html: page.html }} />;
}

function ExtraWidget({ path }: { path: string }) {
  if (path === "/status") return <StatusProbe />;
  if (path === "/playground") return <PlaygroundRunner />;
  if (path === "/support") return <SupportDesk />;
  return null;
}

function Links({ links }: { links: Array<[string, string]> }) {
  if (!links.length) return null;
  return <div className="migrated-link-grid">{links.map(([href, label]) => <Link className="migrated-link-card" href={href} key={`${href}-${label}`}><span>{label}</span><ArrowUpRight size={16} /></Link>)}</div>;
}

export function PublicMigratedPage({ page }: { page: MigratedPage }) {
  const content = <>
    <header className="migrated-hero container">
      <span className="eyebrow">{page.eyebrow}</span>
      <h1 className="display">{page.title}</h1>
      <p>{page.description}</p>
    </header>
    <div className="container migrated-body">
      <ExtraWidget path={page.path} />
      <section className="panel migrated-panel" aria-label={`${page.title} content`}>
        <div className="migrated-source-label"><BookOpenText size={16} /> Migrated from {page.templates.join(", ")}</div>
        <SourceContent page={page} />
      </section>
      <Links links={page.links} />
      {page.audience === "auth" && <div className="migrated-account-cta"><ShieldCheck size={17} /><span>Account action completed only after the Django backend confirms it.</span><Link href="/login">Sign in</Link></div>}
    </div>
  </>;

  if (page.audience === "auth") {
    return <AuthShell title="Secure account access, built around your Linkify workspace."><div className="auth-card migrated-auth-card"><span className="eyebrow">{page.eyebrow}</span><h1 className="display">{page.title}</h1><p>{page.description}</p><section className="migrated-auth-copy"><SourceContent page={page} /></section><Links links={page.links} /><p className="migrated-auth-footnote"><CircleHelp size={15} /> If you did not request this account change, contact support.</p></div></AuthShell>;
  }

  return <><MarketingNav /><main id="main-content" className="migrated-page"><PublicMigratedPageContent content={content} /></main><SiteFooter /></>;
}

function PublicMigratedPageContent({ content }: { content: ReactNode }) {
  return <>{content}<section className="container migrated-bottom-cta"><div><span className="eyebrow">Linkify Media</span><h2 className="display">Build your next media experience.</h2><p>Search movies and TV, resolve rich metadata, and keep your integration on a predictable API.</p></div><Link className="btn btn-primary" href="/docs"><Code2 size={17} /> Read the docs</Link></section></>;
}

export function getMigratedPage(slug: string): MigratedPage | undefined {
  return migratedPages[slug];
}
