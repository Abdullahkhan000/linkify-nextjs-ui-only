import type { Metadata } from "next";
import { PublicMigratedPage, getMigratedPage } from "@/components/migrated-template-page";

export const metadata: Metadata = { title: "Terms of service", description: "Review the terms for Linkify Media accounts, API keys, acceptable use, plans, third-party content, availability and termination." };
export default function TermsPage() { const page = getMigratedPage("terms"); return page ? <PublicMigratedPage page={page} /> : null; }
