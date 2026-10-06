"use client";

import { FormEvent, useEffect, useState } from "react";
import { Activity, AlertTriangle, Bot, CircleCheck, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { backend, errorMessage } from "@/lib/api";

type Probe = { state: "loading" | "ok" | "error"; label: string; detail?: string };

export function StatusProbe() {
  const [checks, setChecks] = useState<{ health: Probe; ready: Probe }>({
    health: { state: "loading", label: "Health" },
    ready: { state: "loading", label: "Readiness" },
  });
  useEffect(() => {
    let live = true;
    async function check(path: string, label: string): Promise<Probe> {
      try {
        const response = await fetch(`/api/backend/api/${path}/`, { cache: "no-store", credentials: "include" });
        const body = await response.text();
        let detail = body;
        try { detail = JSON.stringify(JSON.parse(body)); } catch { /* plain text is useful diagnostic detail */ }
        return { state: response.ok ? "ok" : "error", label, detail: `${response.status} · ${detail.slice(0, 180)}` };
      } catch (reason) { return { state: "error", label, detail: errorMessage(reason) }; }
    }
    void Promise.all([check("health", "Health"), check("ready", "Readiness")]).then(([health, ready]) => {
      if (live) setChecks({ health, ready });
    });
    return () => { live = false; };
  }, []);
  const values = [checks.health, checks.ready];
  return <section className="probe-panel" aria-live="polite"><div className="probe-heading"><Activity size={19} /><div><b>Live service checks</b><small>Responses are fetched from the configured Django backend.</small></div></div><div className="probe-grid">{values.map((item) => <div className="probe-card" key={item.label}><span className={`probe-dot ${item.state}`} /> <b>{item.label}</b><span className="probe-state">{item.state === "loading" ? "Checking…" : item.state === "ok" ? "Responded" : "Unavailable"}</span><small>{item.detail ?? "Waiting for backend response"}</small></div>)}</div></section>;
}

type PlaygroundResult = { status: number; body: unknown };
export function PlaygroundRunner() {
  const [query, setQuery] = useState("Inception");
  const [mediaType, setMediaType] = useState("movie");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlaygroundResult>();
  const path = `/api/backend/api/search/?q=${encodeURIComponent(query.trim())}&type=${encodeURIComponent(mediaType)}`;
  async function run(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) { setError("Enter at least two characters to search."); return; }
    setBusy(true); setError(""); setResult(undefined);
    try {
      const response = await fetch(path, { headers: apiKey.trim() ? { "X-API-Key": apiKey.trim() } : {}, credentials: "include", cache: "no-store" });
      const raw = await response.text();
      let body: unknown = raw;
      try { body = JSON.parse(raw); } catch { /* retain backend response text */ }
      setResult({ status: response.status, body });
      if (!response.ok) setError("The backend rejected this request. Inspect the real response below; no success is assumed.");
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }
  return <section className="playground-panel"><div className="playground-heading"><span className="feature-icon"><Bot /></span><div><b>Request builder</b><small>Run a real request through the same-origin Django proxy.</small></div></div><form onSubmit={run} className="playground-form"><label className="field"><span>Title</span><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={200} placeholder="Search a title" /></label><div className="playground-row"><label className="field"><span>Type</span><select className="input" value={mediaType} onChange={(event) => setMediaType(event.target.value)}><option value="movie">Movie</option><option value="tv">TV</option></select></label><label className="field"><span>Country</span><input className="input" value="us" readOnly aria-label="Country (US)" /></label></div><label className="field"><span>Personal test API key <small>(optional)</small></span><input className="input" value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" autoComplete="off" placeholder="Enter a test key for this request only" /></label><p className="playground-warning"><AlertTriangle size={15} /> A personal key is sent only in the request header and is not saved. Prefer a short-lived demo token; the reviewed backend currently does not expose a token-issue endpoint.</p><button className="btn btn-primary" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16} /> Running…</> : "Run request"}</button></form><div className="playground-response"><div className="playground-response-head"><b>Response</b><span>{result ? `HTTP ${result.status}` : "Ready"}</span></div>{error && <p className="form-alert error" role="alert">{error}</p>}<pre>{result ? JSON.stringify(result.body, null, 2) : `GET ${path.replace("/api/backend", "") }\n\nRun a request to see the backend's JSON response here.`}</pre></div></section>;
}

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatResponse = { conversation_id: string; message: string; status: string; can_escalate: boolean };
type TicketResponse = { ticket_id: number; status: string; message: string };
export function SupportDesk() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi, I’m Linkify’s support assistant. Ask about API keys, search requests, batch calls, usage limits, billing, or account troubleshooting. Never paste credentials." }]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || message.length > 4000) { setError("Enter a message between 1 and 4,000 characters."); return; }
    setChatBusy(true); setError(""); setNotice(""); setInput("");
    try {
      const answer = await backend<ChatResponse>("api/support/chat/", { method: "POST", body: JSON.stringify({ message, ...(conversationId ? { conversation_id: conversationId } : {}) }) });
      setConversationId(answer.conversation_id);
      setMessages((current) => [...current, { role: "user", content: message }, { role: "assistant", content: answer.message }]);
    } catch (reason) { setInput(message); setError(errorMessage(reason)); }
    finally { setChatBusy(false); }
  }
  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!conversationId) { setError("Start a support conversation first so the ticket can include its transcript."); return; }
    const form = event.currentTarget; const formData = new FormData(form);
    setTicketBusy(true); setError(""); setNotice("");
    try {
      const result = await backend<TicketResponse>("api/support/ticket/", { method: "POST", body: JSON.stringify({ conversation_id: conversationId, name: formData.get("name"), email: formData.get("email"), subject: formData.get("subject"), message: formData.get("message") }) });
      setNotice(`${result.message} Ticket #${result.ticket_id}.`); form.reset();
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setTicketBusy(false); }
  }
  return <div className="support-workspace"><section className="support-chat panel"><div className="panel-head"><div><h2>Linkify Support AI</h2><small>Developer support with instant human handoff</small></div><span className="scope"><span className="probe-dot ok" /> Online</span></div><div className="support-messages" aria-live="polite">{messages.map((item, index) => <div className={`support-message ${item.role}`} key={`${item.role}-${index}`}><span>{item.role === "assistant" ? "Linkify assistant" : "You"}</span><p>{item.content}</p></div>)}</div><form className="support-input-row" onSubmit={send}><input className="input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={4000} placeholder="Describe your issue — never paste secrets…" aria-label="Ask the support assistant" /><button className="btn btn-primary icon-btn" disabled={chatBusy} aria-label="Send message">{chatBusy ? <LoaderCircle size={17} className="spin" /> : <Send size={17} />}</button></form><small className="support-privacy">AI responses may be imperfect. Do not share API keys, passwords, or payment details.</small></section><form className="panel support-ticket form-grid" onSubmit={createTicket}><div className="panel-head"><div><h2>Talk to a human</h2><small>Escalate this conversation to support.</small></div><MessageCircle size={19} /></div><label className="field"><span>Your name</span><input className="input" name="name" autoComplete="name" required /></label><label className="field"><span>Email address</span><input className="input" type="email" name="email" autoComplete="email" required /></label><label className="field"><span>Subject</span><input className="input" name="subject" maxLength={180} required /></label><label className="field"><span>Add context (optional)</span><textarea className="input" name="message" rows={4} /></label><button className="btn btn-secondary" disabled={ticketBusy || !conversationId}>{ticketBusy ? "Creating ticket…" : "Create support ticket"}</button><small>Ticket creation is enabled after a real conversation ID is returned by the backend.</small></form>{error && <div className="form-alert error" role="alert">{error}</div>}{notice && <div className="form-alert success" role="status"><CircleCheck size={16} /> {notice}</div>}</div>;
}
