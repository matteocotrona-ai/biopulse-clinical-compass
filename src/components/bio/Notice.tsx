import { AlertTriangle, Info, ServerCrash } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { API, API_CONFIGURED } from "@/lib/api";

const TONES = {
  info: { icon: Info, cls: "border-primary/25 bg-primary/[0.06] [&_svg]:text-primary-glow" },
  warn: { icon: AlertTriangle, cls: "border-warning/30 bg-warning/[0.06] [&_svg]:text-warning" },
  error: { icon: AlertTriangle, cls: "border-destructive/35 bg-destructive/[0.08] [&_svg]:text-destructive" },
};

export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
  role,
}: {
  tone?: keyof typeof TONES;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  const { icon: Icon, cls } = TONES[tone];
  return (
    <div
      role={role ?? (tone === "error" ? "alert" : undefined)}
      className={cn("flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm", cls, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 leading-relaxed text-muted-foreground">
        {title && <b className="mr-1 font-medium text-foreground">{title}</b>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Explains the missing backend configuration instead of faking data. */
export function BackendNotice({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-warning/30 bg-warning/[0.05] p-4 text-sm", className)} role="alert">
      <div className="flex items-center gap-2 text-foreground">
        <ServerCrash className="size-4 text-warning" />
        <b className="font-medium">Servizio BioPulse non raggiungibile</b>
      </div>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        L'interfaccia chiama il backend su{" "}
        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">{API}</code>
        {API_CONFIGURED
          ? ". Verifica che sia avviato e che consenta richieste da questo dominio (CORS e cookie)."
          : ", indirizzo locale predefinito. Avvia il backend o configura VITE_API_URL con l'endpoint HTTPS pubblico."}
      </p>
    </div>
  );
}
