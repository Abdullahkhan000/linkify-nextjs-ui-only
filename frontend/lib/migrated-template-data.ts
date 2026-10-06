import migration from "@/data/django-template-migration.json";

export type MigratedPage = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  audience: "public" | "private" | "auth";
  templates: string[];
  links: Array<[string, string]>;
  html: string;
  sourceCopy: string[];
};

export const migratedPages = migration.pages as unknown as Record<string, MigratedPage>;
export const migratedTemplateCatalog = migration.templates;
