import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
export default function NotFound(){return <><MarketingNav/><main className="section"><div className="container panel migrated-not-found"><span className="eyebrow">404 · Not found</span><h1 className="display">That page isn’t here.</h1><p>The route may have moved during the Django-to-Next.js UI migration.</p><Link className="btn btn-primary" href="/"><ArrowLeft size={17}/> Return home</Link></div></main><SiteFooter/></>}
