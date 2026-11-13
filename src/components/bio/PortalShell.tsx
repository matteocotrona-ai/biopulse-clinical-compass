import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScanHeart,
  Sparkles,
  Stethoscope,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import { logout } from "@/lib/api";
import { keys } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { Ambient } from "./Ambient";
import { Brand, BrandMark } from "./Brand";
import { EASE } from "./motion";
import { usePortal } from "./PortalProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: "/dashboard" | "/assistant" | "/profile"; label: string; short: string; icon: typeof LayoutDashboard };

export function PortalShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { session, data, athleteId, setAthleteId, setError } = usePortal();
  const [collapsed, setCollapsed] = useState(false);
  const athlete = session.athletes.find((item) => item.id === athleteId);
  const isAthlete = session.user.role === "athlete";
  const nav: NavItem[] = [
    { to: "/dashboard", label: "Panoramica", short: "Panoramica", icon: LayoutDashboard },
    isAthlete
      ? { to: "/assistant", label: "BioPulse AI", short: "AI", icon: Sparkles }
      : { to: "/assistant", label: "Area clinica", short: "Clinica", icon: Stethoscope },
    { to: "/profile", label: "Il mio profilo", short: "Profilo", icon: UserRound },
  ];

  useEffect(() => {
    setCollapsed(localStorage.getItem("biopulse-sidebar") === "collapsed");
  }, []);
  function toggleSidebar() {
    setCollapsed((c) => {
      localStorage.setItem("biopulse-sidebar", c ? "open" : "collapsed");
      return !c;
    });
  }

  async function signOut() {
    try {
      await logout();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      localStorage.removeItem(keys.onboarding(session.user.id));
      navigate({ to: "/", replace: true });
    }
  }

  const displayName = athlete?.name ?? session.user.email;
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="relative min-h-screen">
      <Ambient />

      {/* Desktop sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex"
        animate={{ width: collapsed ? 84 : 264 }}
        initial={false}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className={cn("flex h-20 items-center", collapsed ? "justify-center" : "px-6")}>
          {collapsed ? (
            <Link to="/dashboard" aria-label="BioPulse, panoramica">
              <BrandMark />
            </Link>
          ) : (
            <Brand to="/dashboard" />
          )}
        </div>
        {!collapsed && <p className="mt-6 mb-3 px-7 eyebrow text-faint">Il tuo spazio</p>}
        <nav className={cn("grid gap-1", collapsed ? "mt-6 px-3" : "px-3")} aria-label="Navigazione principale">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex h-11 items-center gap-3 rounded-lg text-sm transition-colors",
                  collapsed ? "justify-center" : "px-4",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg border border-primary/25 bg-gradient-to-r from-primary/20 to-primary/[0.03]"
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-bar"
                    className="absolute top-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary-glow shadow-glow"
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative size-[1.1rem] transition-transform duration-300 group-hover:scale-110",
                    active && "text-primary-glow",
                  )}
                />
                {!collapsed && <span className="relative">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn("mt-auto grid gap-4 pb-6", collapsed ? "px-3" : "px-4")}>
          {!collapsed && (
            <div className="rounded-xl border border-border bg-surface/70 p-4">
              <div className="flex items-center gap-2.5">
                <span className="relative grid size-2 place-items-center">
                  <span className="absolute size-2 rounded-full bg-level-green animate-pulse-ring" />
                  <span className="size-2 rounded-full bg-level-green" />
                </span>
                <strong className="text-sm font-medium">Demo controllata</strong>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Fonti sintetiche · no device</p>
              <div className="mt-3 flex gap-3 text-[0.7rem] text-faint">
                <Link to="/ethics" className="hover:text-foreground">Etica</Link>
                <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
                <Link to="/cookies" className="hover:text-foreground">Cookie</Link>
              </div>
            </div>
          )}
          <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
            <button
              onClick={signOut}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                collapsed ? "w-full justify-center" : "px-3",
              )}
              title="Esci dall'account"
            >
              <LogOut className="size-4" />
              {!collapsed && "Esci dall'account"}
            </button>
            <button
              onClick={toggleSidebar}
              className="grid size-9 place-items-center rounded-lg text-faint transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={collapsed ? "Espandi barra laterale" : "Riduci barra laterale"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </div>
        </div>
      </motion.aside>

      <div
        className="relative z-10 flex min-h-screen flex-col pb-28 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:pb-0 lg:pl-[var(--sidebar-w)]"
        style={{ ["--sidebar-w" as string]: collapsed ? "84px" : "264px" }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
            <div className="flex items-center gap-4">
              <span className="lg:hidden">
                <Brand to="/dashboard" compact />
              </span>
              <span className="hidden items-center gap-2 eyebrow sm:flex">
                <span className="glow-dot" /> Spazio personale
              </span>
              {session.athletes.length > 1 && (
                <select
                  aria-label="Seleziona atleta"
                  value={athleteId}
                  onChange={(event) => setAthleteId(event.target.value)}
                  className="field h-9 w-auto rounded-full px-4 text-sm"
                >
                  {session.athletes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex items-center gap-3 rounded-full border border-border bg-surface/60 py-1 pr-3 pl-1 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="grid size-8 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                  {initial}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <strong className="block max-w-[12rem] truncate text-sm font-medium">{displayName}</strong>
                  <small className="text-[0.7rem] text-muted-foreground">
                    Profilo atleta · {data?.athlete.profile ?? "standard"}
                  </small>
                </span>
                <ChevronDown className="size-4 text-faint transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="glass w-60 rounded-xl border-border-strong bg-popover/85 p-1.5 shadow-lift"
              >
                <DropdownMenuLabel className="px-2.5 py-2">
                  <span className="block truncate text-sm font-medium">{displayName}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{session.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 focus:bg-accent">
                  <Link to="/profile">
                    <UserRound className="size-4" /> Il mio profilo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 focus:bg-accent">
                  <Link to="/ethics">
                    <ShieldCheck className="size-4" /> Etica e limiti
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onSelect={signOut}
                  className="rounded-lg px-2.5 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="size-4" /> Esci dall'account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <motion.div
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {children}
        </motion.div>

        <footer className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-6 font-mono text-[0.65rem] tracking-[0.08em] text-faint sm:px-6 lg:px-10">
          <span>BIOPULSE-AGENT · PROTOTIPO DIMOSTRATIVO</span>
          <span>NON È UN DISPOSITIVO MEDICO · DATI DEMO</span>
          <Link to="/ethics" className="transition-colors hover:text-foreground">
            ETICA, LIMITI E ACCESSIBILITÀ ↗
          </Link>
        </footer>
      </div>

      {/* Mobile floating nav */}
      <nav
        className="glass fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-2xl p-1.5 shadow-lift lg:hidden"
        aria-label="Navigazione mobile"
      >
        {nav.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.7rem] transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute inset-0 rounded-xl bg-primary/15 ring-1 ring-primary/30"
                  transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                />
              )}
              <Icon className={cn("relative size-5", active && "text-primary-glow")} />
              <span className="relative">{item.short}</span>
            </Link>
          );
        })}
        <Link
          to="/ethics"
          className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.7rem] text-muted-foreground"
        >
          <ScanHeart className="size-5" />
          <span>Limiti</span>
        </Link>
      </nav>
    </div>
  );
}

/** Standard page header used on every portal page. */
export function PageHeading({
  eyebrow,
  title,
  accent,
  lead,
  action,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 eyebrow">
          <span className="glow-dot" /> {eyebrow}
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[0.98] font-light">
          {title}
          {accent && <span className="font-serif-accent text-gradient-blue"> {accent}</span>}
        </h1>
        {lead && <p className="mt-4 max-w-xl text-[0.975rem] leading-relaxed text-muted-foreground">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14", className)}>{children}</main>;
}

export function SectionLabel({ index, children, note }: { index: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 eyebrow">
      <span className="text-primary-glow">{index}</span>
      <span className="h-px w-6 bg-border-strong" />
      <span className="text-foreground/80">{children}</span>
      {note && <span className="ml-auto rounded-full border border-border px-2 py-1 text-[0.6rem] text-faint">{note}</span>}
    </div>
  );
}
