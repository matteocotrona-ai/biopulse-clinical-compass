export type Level = "green" | "yellow" | "red" | "unknown";

export interface Flag { code: string; severity: "red" | "yellow" | "info"; message: string }
export interface Report {
  as_of: string | null; acwr: number | null; acute_load: number | null; chronic_load: number | null;
  acwr_zone: string; rmssd_ms: number | null; hrv_z: number | null; resting_hr: number | null; rhr_z: number | null;
  sleep_efficiency: number | null; spo2: number | null; readiness: number | null; level: Level;
  confidence: "full" | "partial" | "insufficient"; data_days: number; flags: Flag[]; explanations: string[];
}
export interface SeriesPoint {
  day: string; rmssd_ms: number | null; resting_hr: number | null; sleep_efficiency: number | null;
  sleep_hours: number | null; spo2: number | null; skin_temp_c: number | null; rpe: number | null; load: number;
}
export interface Athlete { id: string; name: string; profile: string; consent_data: boolean; consent_alerts: boolean }
export interface Dashboard { athlete: Athlete; report: Report; series: SeriesPoint[] }
export interface SessionInfo {
  user: { id: string; email: string; role: "athlete" | "clinician" | "admin" };
  athletes: Pick<Athlete, "id" | "name" | "profile">[];
  csrf_token: string | null;
  demo_mode: boolean;
}
export interface WearableSyncResult {
  provider: string;
  status: "success";
  records_received: number;
  records_accepted: number;
  rejected_count: number;
  cursor_day: string | null;
  last_success_at: string;
  synthetic: boolean;
}

export interface TraceEvent {
  type: "trace"; step: string; status: "ok" | "warn" | "error"; title: string; detail: string;
  data: Record<string, unknown>; t_ms: number;
}
export interface MessageEvent {
  type: "message"; text: string; source: string; level: Level | null; held: boolean; corrected: boolean; readiness: number | null;
}
export type ChatEvent = TraceEvent | MessageEvent | { type: "done"; elapsed_ms: number };

export interface HitlCase {
  id: number; athlete_id: string; athlete_name: string | null; status: "pending" | "approved" | "modified" | "rejected";
  trigger: string; level: Level; report: Report; draft_text: string; final_text: string | null;
  reviewer: string | null; reviewer_note: string | null; created_at: string; reviewed_at: string | null;
}
export interface AlertItem { id: number; athlete_id: string; channel: string; body: string; simulated: boolean; created_at: string }
export type Scenario = "normal" | "overload" | "hrv_drop" | "recovery";
