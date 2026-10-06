import type { Metadata } from "next";
import Link from "next/link";
import { Braces, KeyRound, Search, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Developer docs", description: "Get a Linkify Media API key, authenticate safely, and make your first media search request." };
const requestExample = ['curl "https://api.example.com/api/v1/search/results/?q=Inception" \\', '  -H "X-API-Key: $LINKIFY_KEY"'].join("\n");
const responseExample = JSON.stringify({ page: 1, results: [{ title: "Inception", release_year: "2010", rating: 8.4 }] }, null, 2);
const concepts = [
  { Icon: KeyRound, title: "Authenticate", copy: "Send X-API-Key on every server-side request. Never expose the secret in browser code." },
  { Icon: Search, title: "Discover", copy: "Search movies and TV with type, query, filters and pagination." },
  { Icon: Braces, title: "Integrate", copy: "Use the REST API from Python, JavaScript or another server-side runtime." },
  { Icon: ShieldCheck, title: "Protect", copy: "Rotate, scope and expire keys from your console." },
];

export default function DocsPage() {
  return <><MarketingNav /><main id="main-content" className="section"><div className="container"><div className="section-heading"><span className="eyebrow">Developer quickstart</span><h1 className="display" style={{fontSize:"clamp(48px,6vw,76px)"}}>Your first result in under a minute.</h1><p>Use the versioned REST API from any server-side runtime. Never expose your secret in browser code.</p></div><div className="dashboard-grid"><div className="panel" style={{padding:30}}><div className="panel-head"><h2 className="display">Search media</h2><span className="scope">GET</span></div><pre className="code-sample">{requestExample}</pre><h3>Response</h3><pre className="response-sample">{responseExample}</pre></div><aside className="concept-list">{concepts.map(({Icon,title,copy})=><div className="panel" key={title}><span className="feature-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></div>)}</aside></div><div className="docs-links"><Link href="/api-reference">Open the Next.js API reference</Link><Link href="/playground">Try the API playground</Link><p>Swagger UI remains part of the Django backend API at <code>/api/docs/</code>; this page does not send users to a Django-rendered website.</p><Link className="docs-template-reference" href="/template-reference">Review all 64 migrated template files (HTML + account email text)</Link></div></div></main><SiteFooter /></>;
}
