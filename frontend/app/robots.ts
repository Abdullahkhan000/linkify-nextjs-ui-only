import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/account", "/billing", "/platform", "/teams", "/webhooks", "/usage-logs", "/analytics", "/audit", "/mfa", "/social", "/login", "/signup", "/logout", "/change-password", "/set-password", "/change-email", "/forgot-password", "/reset-password", "/verify-email", "/account-exists", "/account-inactive", "/template-reference"] }],
  };
}
