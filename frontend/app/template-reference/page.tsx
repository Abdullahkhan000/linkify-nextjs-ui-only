import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
import archive from "@/data/django-template-archive.json";

export const metadata: Metadata = {
  title: "Django template migration reference",
  description: "Review the sanitized, user-visible copy and Next.js destination mapped from each Django HTML template.",
  robots: { index: false, follow: false },
};

type SourceTemplate = { file: string; kind: string; route: string; component: string; copy: string[]; html: string };
const templates = archive.templates as SourceTemplate[];

export default function TemplateReferencePage() {
  return <><MarketingNav/><main id="main-content" className="migrated-page"><header className="migrated-hero container"><span className="eyebrow">Migration reference · {templates.length} source files</span><h1 className="display">Every Django template, mapped.</h1><p>Review the sanitized text and safe markup extracted from each source template alongside its Next.js destination. Django-only controls and data-dependent states are not represented as live UI.</p></header><section className="container template-archive"><div className="template-archive-head"><BookOpenText size={18}/><span>Source copy · Next.js destination · Component</span><Link href="/docs">Back to developer docs</Link></div>{templates.map((template)=><details className="template-archive-item" key={template.file}><summary><b>{template.file}</b><span>{template.route}</span></summary><div className="template-archive-meta"><span>{template.kind}</span><code>{template.component}</code></div>{template.html?<div className="migrated-template-copy" dangerouslySetInnerHTML={{__html:template.html}}/>:<div className="template-copy-chips">{template.copy.length?template.copy.map((text,index)=><p key={`${index}-${text}`}>{text}</p>):<p>No static user-facing text in this shared template.</p>}</div>}</details>)}</section></main><SiteFooter/></>;
}
