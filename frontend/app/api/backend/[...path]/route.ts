import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROOTS = new Set(["_allauth", "api", "billing", "usage-logs"]);
const SAFE_RESPONSE_HEADERS = ["content-type", "cache-control", "content-disposition", "location"];

function appendSetCookies(upstream: Headers, downstream: Headers) {
  for (const cookie of upstream.getSetCookie()) downstream.append("set-cookie", cookie);
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path.length || !ALLOWED_ROOTS.has(path[0]) || path.some((segment) => segment === "..")) {
    return NextResponse.json({ error: "Unsupported backend route." }, { status: 404 });
  }

  const configuredBase = process.env.DJANGO_INTERNAL_URL?.trim();
  if (!configuredBase) {
    return NextResponse.json({ error: "DJANGO_INTERNAL_URL is not configured." }, { status: 503 });
  }
  let base: URL;
  try { base = new URL(configuredBase); }
  catch { return NextResponse.json({ error: "DJANGO_INTERNAL_URL must be an absolute HTTP(S) URL." }, { status: 503 }); }
  if (!(["http:", "https:"].includes(base.protocol)) || base.username || base.password) {
    return NextResponse.json({ error: "DJANGO_INTERNAL_URL must be an HTTP(S) origin without embedded credentials." }, { status: 503 });
  }
  const upstream = new URL(`/${path.map(encodeURIComponent).join("/")}`, base.origin);
  if (path[0] !== "_allauth" && !upstream.pathname.endsWith("/")) {
    upstream.pathname += "/";
  }
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "_redirect") upstream.searchParams.append(key, value);
  });

  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "origin", "referer", "x-csrftoken", "x-requested-with", "x-api-key", "x-demo-token"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const method = request.method.toUpperCase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(upstream, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : await request.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    });

    const location = response.headers.get("location");
    if (request.nextUrl.searchParams.get("_redirect") === "manual" && location && response.status >= 300 && response.status < 400) {
      const redirectHeaders = new Headers({ "cache-control": "no-store" });
      appendSetCookies(response.headers, redirectHeaders);
      return NextResponse.json({ redirect: location }, { headers: redirectHeaders });
    }

    const outputHeaders = new Headers();
    for (const name of SAFE_RESPONSE_HEADERS) {
      const value = response.headers.get(name);
      if (value) outputHeaders.set(name, value);
    }
    outputHeaders.set("cache-control", "no-store");
    appendSetCookies(response.headers, outputHeaders);
    return new NextResponse(response.body, { status: response.status, headers: outputHeaders });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "The backend timed out."
      : "The backend is unavailable.";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
