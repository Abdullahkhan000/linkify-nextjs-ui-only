"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowUpRight, CircleAlert, CreditCard, Download, LoaderCircle, LockKeyhole, Mail, ShieldAlert, Users, Webhook } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import type { MigratedPage } from "@/lib/migrated-template-data";
import { AuthUser, backend, csrfToken, errorMessage, session } from "@/lib/api";

type RecordValue = Record<string, unknown>;
type UsageRow = { created_at: string; key_name: string; endpoint: string; method: string; status_code: number | null; latency_ms: number | null };
type Analytics = { total_7d: number; success_rate: number | null; average_latency_ms: number | null; daily: Array<{ date: string; count: number }> };
type Profile = { username?: string; email?: string; tier?: string };

function TemplateReference({ page }: { page: MigratedPage }) {
  if (!page.html) return null;
  return <details className="template-reference"><summary>Original Django template copy (reference only)</summary><p>Static source text is retained here; data-dependent states and controls are not presented as live backend results.</p><div className="migrated-template-copy" dangerouslySetInnerHTML={{ __html: page.html }} /></details>;
}

function UnavailableWorkspace({ page, why }: { page: MigratedPage; why: string }) {
  const Icon = page.path === "/teams" ? Users : page.path === "/webhooks" ? Webhook : page.path === "/audit" ? ShieldAlert : Activity;
  return <div className="workspace-stack"><section className="panel unavailable-panel"><span className="feature-icon"><Icon /></span><div><span className="eyebrow">Backend capability not available</span><h2 className="display">{page.title}</h2><p>{page.description}</p><div className="form-alert warning"><CircleAlert size={17} />{why}</div><p>No records are fabricated, and any legacy action labels below are reference copy only.</p><div className="migrated-link-grid">{page.links.map(([href,label])=><Link className="migrated-link-card" href={href} key={href}><span>{label}</span><ArrowUpRight size={16}/></Link>)}</div></div></section><TemplateReference page={page}/></div>;
}

function AnalyticsWorkspace() {
  const [data, setData] = useState<Analytics>(); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setData(await backend<Analytics>("api/v1/account/analytics/")); } catch (reason) { setError(errorMessage(reason)); } finally { setLoading(false); } }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  return <div className="workspace-stack"><section className="stat-grid"><article className="stat-card"><span>Requests · 7 days</span><b className="stat-value">{loading ? "—" : data?.total_7d ?? "—"}</b></article><article className="stat-card"><span>Successful responses</span><b className="stat-value">{data?.success_rate == null ? "—" : `${data.success_rate}%`}</b></article><article className="stat-card"><span>Average latency</span><b className="stat-value">{data?.average_latency_ms == null ? "—" : `${data.average_latency_ms} ms`}</b></article></section>{error && <div className="form-alert error" role="alert">{error}</div>}<section className="panel migrated-data-panel"><div className="panel-head"><div><h2>Seven-day request activity</h2><small>Aggregated from your own API keys only.</small></div><button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></div>{loading ? <div className="skeleton"/> : data ? <div className="daily-grid">{data.daily.map((day)=><div className="daily-bar" key={day.date}><b>{day.count}</b><span style={{height:`${Math.max(7,Math.min(100,(day.count / Math.max(1,...data.daily.map((x)=>x.count)))*100))}%`}}/><small>{day.date}</small></div>)}</div> : <p>Analytics are unavailable until the backend responds.</p>}</section></div>;
}

function UsageLogsWorkspace() {
  const [rows, setRows] = useState<UsageRow[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await backend<{results:UsageRow[]}|UsageRow[]>("api/v1/account/usage-logs/"); setRows(Array.isArray(response)?response:response.results); } catch (reason) { setError(errorMessage(reason)); } finally { setLoading(false); } }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  return <div className="workspace-stack"><section className="panel migrated-data-panel"><div className="panel-head"><div><h2>Recent API requests</h2><small>Up to 100 records · newest first · key secrets are never included.</small></div><div className="panel-actions"><button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button><Link className="btn btn-primary" href="/api/backend/usage-logs/export/" prefetch={false} download><Download size={16}/> Export CSV</Link></div></div>{error && <div className="form-alert error" role="alert">{error}</div>}{loading ? <div className="skeleton"/> : rows.length ? <div className="table-scroll"><table className="migrated-table"><thead><tr><th>Time</th><th>API key</th><th>Method</th><th>Endpoint</th><th>Status</th><th>Latency</th></tr></thead><tbody>{rows.map((row,index)=><tr key={`${row.created_at}-${index}`}><td>{new Date(row.created_at).toLocaleString()}</td><td>{row.key_name}</td><td>{row.method}</td><td><code>{row.endpoint}</code></td><td>{row.status_code ?? "—"}</td><td>{row.latency_ms == null ? "—" : `${row.latency_ms} ms`}</td></tr>)}</tbody></table></div> : <p>No usage logs were returned by the backend.</p>}</section></div>;
}

function PlatformWorkspace({ user }: { user: AuthUser }) {
  const [profile, setProfile] = useState<Profile>(); const [keys, setKeys] = useState<RecordValue[]>([]); const [error, setError] = useState("");
  useEffect(() => { let active=true; void Promise.all([backend<Profile>("api/v1/account/profile/"),backend<RecordValue[]>("api/keys/")]).then(([p,k])=>{if(active){setProfile(p);setKeys(k)}}).catch((reason)=>{if(active)setError(errorMessage(reason))}); return ()=>{active=false}; }, []);
  return <div className="workspace-stack"><section className="welcome-panel"><div><span className="eyebrow">Developer platform</span><h2 className="display">Operate with confidence.</h2><p>Everything you need to ship with Linkify Media: keys, usage, testing and service health.</p></div><Link href="/playground" className="btn btn-primary">Open playground <ArrowUpRight size={16}/></Link></section>{error&&<div className="form-alert error">{error}</div>}<section className="stat-grid"><article className="stat-card"><span>Current plan</span><b className="stat-value">{profile?.tier ?? "Loading…"}</b></article><article className="stat-card"><span>API keys returned by backend</span><b className="stat-value">{keys.length}</b></article><article className="stat-card"><span>Signed-in workspace</span><b className="stat-value" style={{fontSize:20}}>{user.username}</b></article></section><section className="launchpad-grid">{[["/dashboard","API keys","Manage scoped credentials"],["/analytics","Analytics","Inspect real usage totals"],["/usage-logs","Usage logs","Review request status and latency"],["/api-reference","API reference","Open route and parameter guidance"],["/teams","Team workspace","Backend does not expose team persistence"],["/webhooks","Webhooks","Backend does not expose webhook management"],["/audit","Audit activity","No audit-log API is mounted"],["/status","Service status","Check health and readiness"]].map(([href,title,copy])=><Link href={href} className="migrated-link-card" key={href}><div><b>{title}</b><small>{copy}</small></div><ArrowUpRight size={16}/></Link>)}</section></div>;
}

function BillingWorkspace() {
  const [profile,setProfile]=useState<Profile>(); const [error,setError]=useState(""); const [busy,setBusy]=useState(""); const [notice,setNotice]=useState("");
  useEffect(()=>{void backend<Profile>("api/v1/account/profile/").then(setProfile).catch((reason)=>setError(errorMessage(reason)))},[]);
  async function openCheckout(tier: string) {
    setBusy(tier); setError(""); setNotice("");
    try {
      const response=await fetch(`/api/backend/billing/checkout/?_redirect=manual`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/x-www-form-urlencoded","X-CSRFToken":csrfToken()},body:new URLSearchParams({tier})});
      const data=await response.json() as {redirect?:string;error?:string};
      if(!response.ok) throw new Error(data.error??`Checkout failed (HTTP ${response.status}).`);
      if(!data.redirect || !data.redirect.startsWith("https://")) throw new Error("The backend did not return a secure checkout URL.");
      window.location.assign(data.redirect);
    } catch(reason) { setError(errorMessage(reason)); }
    finally { setBusy(""); }
  }
  async function openPortal() {
    setBusy("portal"); setError(""); setNotice("");
    try {
      const response=await fetch(`/api/backend/billing/portal/?_redirect=manual`,{method:"POST",credentials:"include",headers:{"X-CSRFToken":csrfToken()}});
      const data=await response.json() as {redirect?:string;error?:string};
      if(!response.ok) throw new Error(data.error??`Portal request failed (HTTP ${response.status}).`);
      if(!data.redirect || !data.redirect.startsWith("https://")) throw new Error("The backend did not return a secure billing portal URL.");
      window.location.assign(data.redirect);
    } catch(reason) { setError(errorMessage(reason)); }
    finally { setBusy(""); }
  }
  const plans=[{tier:"free",name:"Free",price:"$0",limits:"100 requests / day · 1 API key"},{tier:"pro",name:"Pro",price:"$12",limits:"5,000 requests / day · 5 API keys · Batch requests"},{tier:"business",name:"Business",price:"$42",limits:"Unlimited requests · 100 API keys · 100 items per batch"}];
  return <div className="workspace-stack"><section className="welcome-panel"><div><span className="eyebrow">Billing & plans</span><h2 className="display">Choose a plan when you’re ready.</h2><p>Your current plan is read from your account profile. Checkout begins only when you select a paid plan.</p></div><span className="scope">Current plan: {profile?.tier ?? "Loading…"}</span></section>{error&&<div className="form-alert error" role="alert">{error}</div>}{notice&&<div className="form-alert success">{notice}</div>}<section className="pricing-grid migrated-billing-grid">{plans.map((plan)=><article className="panel migrated-plan" key={plan.tier}><span className="eyebrow">{plan.name}</span><h3 className="display">{plan.price}<small> / month</small></h3><p>{plan.limits}</p>{plan.tier==="free"?<span className="scope">Default tier</span>:<button className="btn btn-primary" onClick={()=>openCheckout(plan.tier)} disabled={Boolean(busy)}>{busy===plan.tier?"Opening secure checkout…":`Upgrade to ${plan.name}`}</button>}</article>)}</section><section className="panel migrated-data-panel"><h2>Secure customer portal</h2><p>Open the provider portal only if the backend confirms a secure HTTPS redirect.</p><button className="btn btn-secondary" onClick={openPortal} disabled={Boolean(busy)}><CreditCard size={16}/>{busy==="portal"?"Opening portal…":"Open billing portal"}</button></section></div>;
}

function PasswordWorkflow({ page, setNotice, setError }: { page: MigratedPage; setNotice: (value:string)=>void; setError:(value:string)=>void }) {
  const [busy,setBusy]=useState(false); const setMode=page.path==="/set-password";
  async function submit(event:FormEvent<HTMLFormElement>) { event.preventDefault(); const form=event.currentTarget; const data=new FormData(form); const next=String(data.get("new_password")??""); if(next!==data.get("confirm_password")){setError("The new passwords do not match.");return} setBusy(true);setError("");setNotice(""); try { await backend("_allauth/browser/v1/account/password/change",{method:"POST",body:JSON.stringify({...(setMode?{}:{current_password:data.get("current_password")}),new_password:next})});setNotice(setMode?"The backend accepted the password setup request.":"The backend accepted the password change.");form.reset(); } catch(reason){setError(errorMessage(reason))} finally{setBusy(false)} }
  return <section className="panel migrated-form-panel"><span className="feature-icon"><LockKeyhole/></span><h2>{page.title}</h2><p>{page.description}</p><form className="form-grid" onSubmit={submit}>{!setMode&&<label className="field"><span>Current password</span><input className="input" name="current_password" type="password" autoComplete="current-password" required/></label>}<label className="field"><span>New password</span><input className="input" name="new_password" type="password" minLength={8} autoComplete="new-password" required/></label><label className="field"><span>Confirm new password</span><input className="input" name="confirm_password" type="password" autoComplete="new-password" required/></label><button className="btn btn-primary" disabled={busy}>{busy?"Saving…":setMode?"Set password":"Change password"}</button></form></section>;
}

type EmailAddress = { email:string; verified?:boolean; primary?:boolean };
function findEmails(input: unknown): EmailAddress[] {
  const found: EmailAddress[]=[];
  function visit(value: unknown, depth=0) {
    if(depth>6 || value==null) return;
    if(Array.isArray(value)){value.forEach(x=>visit(x,depth+1));return;}
    if(typeof value!=="object")return;
    const obj=value as Record<string,unknown>;
    if(typeof obj.email==="string")found.push({email:obj.email,verified:obj.verified===true,primary:obj.primary===true});
    Object.values(obj).forEach(x=>visit(x,depth+1));
  }
  visit(input);
  return [...new Map(found.map(item=>[item.email,item])).values()];
}
function EmailWorkflow({ user, setNotice, setError }: { user:AuthUser; setNotice:(value:string)=>void; setError:(value:string)=>void }) {
  const [emails,setEmails]=useState<EmailAddress[]>([]); const [busy,setBusy]=useState(false); const [loaded,setLoaded]=useState(false);
  const load=useCallback(async()=>{try{const data=await backend<unknown>("_allauth/browser/v1/account/email");const next=findEmails(data);setEmails(next.length?next:[{email:user.email,primary:true}]);setLoaded(true);}catch(reason){setError(errorMessage(reason));setLoaded(true)}},[user.email,setError]);
  useEffect(()=>{void Promise.resolve().then(load)},[load]);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=event.currentTarget;const email=String(new FormData(form).get("email")??"").trim();setBusy(true);setError("");setNotice("");try{await backend("_allauth/browser/v1/account/email",{method:"POST",body:JSON.stringify({email})});setNotice("The backend accepted the email request. Follow the verification email if it requires confirmation.");form.reset();await load()}catch(reason){setError(errorMessage(reason))}finally{setBusy(false)}}
  async function action(method:"PUT"|"PATCH"|"DELETE",email:string){setBusy(true);setError("");setNotice("");try{await backend("_allauth/browser/v1/account/email",{method,body:JSON.stringify({email})});setNotice(method==="PUT"?"A verification resend was requested.":method==="PATCH"?"The backend accepted the primary-address change.":"The email address was removed by the backend.");await load()}catch(reason){setError(errorMessage(reason))}finally{setBusy(false)}}
  return <section className="panel migrated-form-panel"><span className="feature-icon"><Mail/></span><h2>Manage email addresses</h2><p>{loaded?"Email status is loaded from the authenticated account API.":"Loading the authenticated email list…"}</p>{emails.map(item=><div className="email-row" key={item.email}><div><b>{item.email}</b><small>{item.primary?"Primary · ":""}{item.verified?"Verified":"Verification pending"}</small></div><div className="panel-actions">{!item.verified&&<button className="btn btn-secondary" disabled={busy} onClick={()=>action("PUT",item.email)}>Resend verification</button>}{!item.primary&&<button className="btn btn-secondary" disabled={busy} onClick={()=>action("PATCH",item.email)}>Make primary</button>}<button className="btn btn-danger" disabled={busy||item.email===user.email} onClick={()=>action("DELETE",item.email)}>Remove</button></div></div>)}<form className="form-grid" onSubmit={submit}><label className="field"><span>Add an email address</span><input className="input" name="email" type="email" autoComplete="email" required/></label><button className="btn btn-primary" disabled={busy}>{busy?"Submitting…":"Add email"}</button></form><small>Changes are confirmed only when the backend responds. New addresses may remain pending until verified.</small></section>;
}

function LogoutWorkflow({ setNotice, setError }: {setNotice:(value:string)=>void;setError:(value:string)=>void}) {
  const router = useRouter();
  const [busy,setBusy]=useState(false); const [done,setDone]=useState(false);
  async function logout(){setBusy(true);setError("");try{await backend("_allauth/browser/v1/auth/session",{method:"DELETE"});setDone(true);setNotice("You have been signed out by the backend.");router.replace("/")}catch(reason){setError(errorMessage(reason));setBusy(false)}}
  return <section className="panel migrated-form-panel"><span className="feature-icon"><LockKeyhole/></span><h2>Sign out of Linkify Media?</h2><p>Your session ends only after the backend confirms the request.</p><button className="btn btn-danger" onClick={logout} disabled={busy||done}>{busy?"Signing out…":"Sign out"}</button><Link href="/dashboard" className="auth-link">Cancel and return to the dashboard</Link></section>;
}

function WorkspaceContent({ page, user }: { page:MigratedPage; user:AuthUser }) {
  const [notice,setNotice]=useState(""); const [error,setError]=useState("");
  let content: React.ReactNode;
  if(page.path==="/analytics") content=<AnalyticsWorkspace/>;
  else if(page.path==="/usage-logs") content=<UsageLogsWorkspace/>;
  else if(page.path==="/platform") content=<PlatformWorkspace user={user}/>;
  else if(page.path==="/billing") content=<BillingWorkspace/>;
  else if(page.path==="/change-password"||page.path==="/set-password") content=<PasswordWorkflow page={page} setNotice={setNotice} setError={setError}/>;
  else if(page.path==="/change-email") content=<EmailWorkflow user={user} setNotice={setNotice} setError={setError}/>;
  else if(page.path==="/logout") content=<LogoutWorkflow setNotice={setNotice} setError={setError}/>;
  else if(page.path==="/mfa"||page.path.startsWith("/mfa/")) content=<UnavailableWorkspace page={page} why="The reviewed Django URL configuration exposes no headless MFA setup, recovery-code, or TOTP management endpoints; these actions are intentionally disabled rather than simulated."/>;
  else if(page.path==="/social/connections") content=<UnavailableWorkspace page={page} why="The reviewed headless API supports social-provider sign-in, but does not expose connected-account listing/disconnect actions. Sign-in providers remain available on the login screen."/>;
  else if(page.path==="/reauthenticate") content=<UnavailableWorkspace page={page} why="The reauthentication UI exists in the source template, but its request contract is not mounted as a standalone account workflow in this Next.js migration. Use the protected account action that invokes the existing backend endpoint."/>;
  else if(page.path==="/audit") content=<UnavailableWorkspace page={page} why="No audit-log model or audit API is present in the reviewed migration head and mounted URL configuration."/>;
  else if(page.path==="/teams") content=<UnavailableWorkspace page={page} why="No team/workspace persistence model or team API is present in the reviewed backend; creation and invitations are not offered as working controls."/>;
  else if(page.path==="/webhooks") content=<UnavailableWorkspace page={page} why="The current migration head does not contain the webhook endpoint/delivery models and the backend URL configuration does not mount webhook-management APIs."/>;
  else content=<section className="panel migrated-form-panel"><h2>{page.title}</h2><p>{page.description}</p><TemplateReference page={page}/></section>;
  return <div className="workspace-stack">{error&&<div className="form-alert error" role="alert">{error}</div>}{notice&&<div className="form-alert success" role="status">{notice}</div>}{content}</div>;
}

export function ProtectedMigratedPage({page}:{page:MigratedPage}) {
  const [user,setUser]=useState<AuthUser>(); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{let active=true;void session().then((response)=>{if(!active)return; if(response.meta?.is_authenticated&&response.data?.user){setUser(response.data.user)}else{window.location.replace(`/login?next=${encodeURIComponent(page.path)}`)}}).catch((reason)=>{if(active)setError(errorMessage(reason))}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[page.path]);
  if(loading)return <main className="auth-page"><div className="auth-card"><LoaderCircle className="spin"/> Checking your session…</div></main>;
  if(!user)return <main className="auth-page"><div className="auth-card"><span className="eyebrow">Protected workspace</span><h1 className="display">Sign-in required</h1><p>{error||"Sign in to view this page."}</p><Link className="btn btn-primary" href={`/login?next=${encodeURIComponent(page.path)}`}>Continue to sign in</Link></div></main>;
  return <DashboardShell user={user} title={page.title}><WorkspaceContent page={page} user={user}/></DashboardShell>;
}
