import type {
  AlertItem,
  ChatEvent,
  Dashboard,
  HitlCase,
  Scenario,
  SessionInfo,
  WearableSyncResult,
} from "./types";

/**
 * Base URL of the BioPulse FastAPI backend.
 * Set VITE_API_URL to the public HTTPS endpoint; defaults to the local Docker backend.
 */
const CONFIGURED_API = import.meta.env["VITE_API_URL"] as string | undefined;
export const API = (CONFIGURED_API ?? "http://localhost:8000").replace(/\/$/, "");
export const API_CONFIGURED = Boolean(CONFIGURED_API);
let csrfToken: string | null = null;

export type ApiError = Error & { status?: number };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Qualcosa non ha funzionato. Riprova tra poco.";
    try {
      const d = (await res.json()).detail;
      if (typeof d === "string") detail = d;
    } catch {
      /* corpo non JSON */
    }
    throw Object.assign(new Error(detail), { status: res.status });
  }
  return res.json() as Promise<T>;
}

function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (csrfToken && init.method && init.method !== "GET") headers.set("X-CSRF-Token", csrfToken);
  return fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
}

const post = (path: string, body: unknown) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export async function login(email: string, password: string) {
  const result = await json<{ user: SessionInfo["user"]; csrf_token: string }>(
    await post("/api/auth/login", { email, password }),
  );
  csrfToken = result.csrf_token;
  return result.user;
}

export async function registerAthlete(email: string, password: string, name: string, profile: string) {
  const result = await json<{ user: SessionInfo["user"]; csrf_token: string }>(
    await post("/api/auth/register", { email, password, name, profile }),
  );
  csrfToken = result.csrf_token;
  return result.user;
}

export const getAuthOptions = () =>
  request("/api/auth/options", { cache: "no-store" }).then((r) =>
    json<{ self_registration: boolean }>(r),
  );

export async function getSession() {
  const result = await json<SessionInfo>(await request("/api/auth/session", { cache: "no-store" }));
  csrfToken = result.csrf_token;
  return result;
}

export async function logout() {
  await json(await post("/api/auth/logout", {}));
  csrfToken = null;
}

export const getDashboard = (id: string) =>
  request(`/api/athletes/${encodeURIComponent(id)}/dashboard`, { cache: "no-store" }).then((r) =>
    json<Dashboard>(r),
  );

export const seedDemo = (athlete_id: string, scenario: Scenario) =>
  post("/api/demo/seed", { athlete_id, scenario }).then((r) => json<Dashboard>(r));

export const syncWearable = (athlete_id: string, scenario: Scenario = "normal") =>
  post(`/api/athletes/${encodeURIComponent(athlete_id)}/wearable/sync`, { scenario }).then((r) =>
    json<WearableSyncResult>(r),
  );

export const setConsent = (id: string, body: { consent_data?: boolean; consent_alerts?: boolean }) =>
  request(`/api/athletes/${encodeURIComponent(id)}/consent`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => json(r));

export const updateAthleteProfile = (id: string, body: { name: string; profile: string }) =>
  request(`/api/athletes/${encodeURIComponent(id)}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => json<{ id: string; name: string; profile: string }>(r));

export const eraseData = (id: string, scope: "memory" | "all") =>
  request(`/api/athletes/${encodeURIComponent(id)}/data?scope=${scope}`, { method: "DELETE" }).then(
    (r) => json(r),
  );

export const getValidated = (id: string) =>
  request(`/api/athletes/${encodeURIComponent(id)}/validated`, { cache: "no-store" }).then((r) =>
    json<HitlCase[]>(r),
  );

export const getCases = () =>
  request("/api/hitl/cases", { cache: "no-store" }).then((r) => json<HitlCase[]>(r));
export const getAlerts = () =>
  request("/api/hitl/alerts", { cache: "no-store" }).then((r) => json<AlertItem[]>(r));
export const decideCase = (
  id: number,
  body: { decision: "approve" | "modify" | "reject"; note?: string; final_text?: string },
) => post(`/api/hitl/cases/${id}/decision`, body).then((r) => json<HitlCase>(r));

/** Legge lo stream SSE della chat e chiama onEvent per ogni evento. */
export async function streamChat(
  body: { athlete_id: string; message: string; simulate_failure?: string | null },
  onEvent: (e: ChatEvent) => void,
): Promise<void> {
  const res = await post("/api/chat", { ...body, simulate_failure: body.simulate_failure || null });
  if (!res.ok || !res.body) {
    let detail = "Il servizio non risponde. Controlla che il backend sia avviato.";
    try {
      const d = (await res.json()).detail;
      if (typeof d === "string") detail = d;
    } catch {
      /* corpo non JSON */
    }
    throw Object.assign(new Error(detail), { status: res.status });
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const p of parts) {
      const line = p.split("\n").find((l) => l.startsWith("data: "));
      if (line) {
        try {
          onEvent(JSON.parse(line.slice(6)) as ChatEvent);
        } catch {
          /* frammento incompleto */
        }
      }
    }
  }
}

/** Errore leggibile per i casi "backend non raggiungibile". */
export function isNetworkError(reason: unknown) {
  const message = (reason as { message?: string })?.message ?? "";
  return reason instanceof TypeError || message === "Failed to fetch" || message.includes("NetworkError");
}
