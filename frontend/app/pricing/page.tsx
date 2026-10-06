import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Plans & pricing", description: "Start free with Linkify Media and review plan limits, API key capacity, and available operational tools." };
const plans = [
  { name: "Free", price: "$0", color: "#dff9fc", features: ["100 requests / day", "1 API key", "Search and usage endpoints"] },
  { name: "Pro", price: "$12", color: "#ede9ff", featured: true, features: ["5,000 requests / day", "5 API keys", "Batch requests"] },
  { name: "Business", price: "$42", color: "#fff3cd", features: ["Unlimited requests", "100 API keys", "100 items per batch"] },
];

export default function PricingPage() {
  return <><MarketingNav /><main id="main-content" className="section"><div className="container"><div className="section-heading pricing-heading"><span className="eyebrow">Plans that scale</span><h1 className="display">Start free. Grow with confidence.</h1><p>Choose the limits and operational tooling that match your product stage. Change plans whenever you need.</p></div><div className="pricing-grid">{plans.map(plan=><article key={plan.name} className="feature-card pricing-card" style={{background:plan.color,border:plan.featured?"2px solid var(--purple)":undefined}}>{plan.featured&&<span className="eyebrow">Most popular</span>}<h2 className="display">{plan.name}</h2><div className="pricing-amount">{plan.price}<small>/ month</small></div><div className="pricing-features">{plan.features.map(item=><span key={item}><Check size={17} color="var(--purple)" />{item}</span>)}</div><Link className={`btn ${plan.featured?"btn-primary":"btn-secondary"} btn-full`} href={plan.name === "Free" ? "/signup" : "/billing"}>{plan.name === "Free" ? "Get started" : `Review ${plan.name} plan`}</Link></article>)}</div><p className="pricing-note">Billing checkout is controlled by the configured payment provider. Do not enter payment details unless you choose a plan and are sent to the provider&apos;s secure checkout.</p><p className="pricing-note">The original Django billing template states: “Billing checkout remains controlled by your configured payment provider. Add provider keys before accepting real payments.”</p></div></main><SiteFooter /></>;
}
