import Link from "next/link";
import { Activity, ArrowRight, BarChart3, Braces, Fingerprint, Globe2, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Linkify Media · One API for entertainment intelligence", description: "Search movies and TV, resolve rich metadata, surface watch providers, and ship personalized media experiences through a unified API." };
const productSignals = ["Movie metadata", "TV discovery", "Watch providers", "Cast intelligence", "Trending signals"];

export default function Home() {
  return <><MarketingNav /><main id="main-content">
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow">Media infrastructure is live</span><h1 className="display">One API.<br /><span>Every screen.</span></h1><p>Search movies and TV, resolve rich metadata, surface watch providers, and ship personalized media experiences without stitching five services together.</p><div className="hero-actions"><Link href="/signup" className="btn btn-primary">Start building free <ArrowRight size={17} /></Link><Link href="/playground" className="btn btn-secondary"><Braces size={17} /> Run a live request</Link></div><div className="trust-row"><span><b>No card required</b></span><span>Instant account access</span><span>Scoped API keys</span></div></div>
      <div className="product-stage" role="img" aria-label="Linkify media API response preview"><div className="glow-orb orb-a" /><div className="glow-orb orb-b" /><div className="console-card"><div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span className="live-pill">API request example</span></div><div className="search-mock"><Search size={17} /> GET /api/v1/search/results/?q=Dune</div><div className="media-result"><div className="poster-art" /><div className="result-copy"><small>JSON · versioned API</small><h3>Structured media data</h3><small>Search · metadata · discovery links</small><div className="tag-row"><span className="tag">Movie</span><span className="tag">TV</span><span className="tag">Providers</span></div></div></div></div><div className="metric-float"><b>One API</b><span>Predictable responses</span></div></div>
    </div></section>
    <div className="logo-strip"><div className="logo-track">{[...productSignals, ...productSignals].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div>
    <section className="section" id="features"><div className="container"><div className="section-heading"><span className="eyebrow">Everything connected</span><h2 className="display">Media data for every step of your product.</h2><p>Discover movies and TV, return useful metadata and keep integration behavior clear from your first request to production.</p></div><div className="bento">
      <article className="feature-card large"><span className="feature-icon"><Search /></span><h3>Search less. Resolve the right title faster.</h3><p>Pagination, year, language, genre and media filters—all through versioned endpoints that return predictable JSON.</p><div className="code-stack"><div className="code-row">GET /api/v1/search/results/?q=Dune</div><div className="code-row">X-API-Key: YOUR_KEY</div><div className="code-row">{`{ "page": 1, "results": [...] }`}</div></div></article>
      <article className="feature-card sun"><span className="feature-icon"><Zap /></span><h3>Production-minded behavior</h3><p>Bounded batches, atomic quotas, and provider retries are part of the runtime.</p></article>
      <article className="feature-card cyan"><span className="feature-icon"><Globe2 /></span><h3>Useful discovery</h3><p>Movies, series, cast, recommendations and regional watch-provider data.</p></article>
      <article className="feature-card"><span className="feature-icon"><BarChart3 /></span><h3>Request visibility</h3><p>Review status, latency, daily activity and recent requests from the console when backend telemetry is available.</p><div className="chart-art">{[42,75,54,90,64,82,100].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div></article>
      <article className="feature-card" id="security"><span className="feature-icon"><Fingerprint /></span><h3>Security built in</h3><p>Hashed API secrets, scopes, expiry, rotation and one-time key reveal.</p></article>
    </div></div></section>
    <section className="section" style={{paddingTop:10}}><div className="container cta-panel"><div><h2 className="display">Turn media data into product momentum.</h2><p>Create an account, issue a scoped key, and make your first server-side request.</p></div><Link href="/signup" className="btn" style={{background:"var(--sun)",color:"var(--ink)",position:"relative",zIndex:2}}>Start building free <Sparkles size={17} /></Link></div></section>
    <section className="container home-reference-links"><Link href="/faq"><ShieldCheck size={17}/> Frequently asked questions</Link><Link href="/api-reference"><Activity size={17}/> API reference</Link></section>
  </main><SiteFooter /></>;
}
