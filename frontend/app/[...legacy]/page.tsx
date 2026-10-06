import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicMigratedPage } from "@/components/migrated-template-page";
import { ProtectedMigratedPage } from "@/components/protected-migrated-page";
import { migratedPages } from "@/lib/migrated-template-data";

const EXPLICIT_ROUTES = new Set(["privacy", "terms"]);
type Props = { params: Promise<{ legacy: string[] }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(migratedPages).filter((slug) => !EXPLICIT_ROUTES.has(slug)).map((slug) => ({ legacy: slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { legacy } = await params;
  const page = migratedPages[legacy.join("/")];
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: page.description,
    robots: page.audience === "public" ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function MigratedRoute({ params }: Props) {
  const { legacy } = await params;
  const page = migratedPages[legacy.join("/")];
  if (!page) notFound();
  return page.audience === "private" ? <ProtectedMigratedPage page={page} /> : <PublicMigratedPage page={page} />;
}
