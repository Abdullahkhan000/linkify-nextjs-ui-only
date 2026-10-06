import type { Metadata } from "next";
import { PublicMigratedPage, getMigratedPage } from "@/components/migrated-template-page";

export const metadata: Metadata = { title: "Privacy policy", description: "Read the Linkify Media privacy policy, including account information, API activity, support information, retention and privacy requests." };
export default function PrivacyPage() { const page = getMigratedPage("privacy"); return page ? <PublicMigratedPage page={page} /> : null; }
