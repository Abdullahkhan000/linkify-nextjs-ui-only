import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand"><Logo /><p>Media intelligence infrastructure with secure credentials, predictable quotas, and developer-first tooling.</p><small>© {new Date().getFullYear()} Linkify Media.</small></div>
        <div className="footer-links"><Link href="/docs">Documentation</Link><Link href="/api-reference">API reference</Link><Link href="/pricing">Plans</Link><Link href="/about">About</Link><Link href="/support">Support</Link><Link href="/status">Status</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
    </footer>
  );
}
