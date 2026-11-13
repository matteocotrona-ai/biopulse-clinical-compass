import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Transition,
} from "framer-motion";
import { PULSI_STATES, type PulsiState } from "./pulsi-states";

export interface PulsiProps {
  state?: PulsiState;
  size?: number;
  className?: string;
  /** Disable cursor tracking globally */
  trackCursor?: boolean;
  title?: string;
}

const spring: Transition = { type: "spring", stiffness: 260, damping: 18 };

/* Hand target positions (center of pill) per state */
type HandPose = { x: number; y: number; r: number };
const HANDS: Record<PulsiState, [HandPose, HandPose]> = {
  idle: [
    { x: 34, y: 150, r: 12 },
    { x: 166, y: 150, r: -12 },
  ],
  welcome: [
    { x: 34, y: 150, r: 12 },
    { x: 176, y: 78, r: -30 },
  ],
  privacy_shield: [
    { x: 78, y: 92, r: 70 },
    { x: 122, y: 92, r: -70 },
  ],
  pairing_sync: [
    { x: 32, y: 140, r: 25 },
    { x: 168, y: 140, r: -25 },
  ],
  analyzing_whitebox: [
    { x: 34, y: 152, r: 10 },
    { x: 150, y: 128, r: -60 },
  ],
  optimal: [
    { x: 26, y: 120, r: 40 },
    { x: 174, y: 120, r: -40 },
  ],
  fatigue_warning: [
    { x: 40, y: 160, r: 5 },
    { x: 160, y: 160, r: -5 },
  ],
  critical_hitl_lock: [
    { x: 34, y: 150, r: 12 },
    { x: 136, y: 168, r: -10 },
  ],
  celebration: [
    { x: 22, y: 70, r: 30 },
    { x: 178, y: 70, r: -30 },
  ],
  security_guard: [
    { x: 116, y: 168, r: 55 },
    { x: 84, y: 168, r: -55 },
  ],
  puzzled: [
    { x: 34, y: 150, r: 12 },
    { x: 150, y: 112, r: -70 },
  ],
};

const HEAD_TILT: Partial<Record<PulsiState, number>> = {
  analyzing_whitebox: -8,
  fatigue_warning: 7,
  puzzled: 10,
};

export function Pulsi({
  state = "idle",
  size = 200,
  className,
  trackCursor = true,
  title,
}: PulsiProps) {
  const cfg = PULSI_STATES[state];
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const tone = `var(--pulsi-${cfg.tone})`;

  /* ---------- cursor tracking (no re-renders) ---------- */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 180, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 180, damping: 20, mass: 0.6 });
  const follow = trackCursor && cfg.trackCursor && !reduce;

  useEffect(() => {
    if (!follow) {
      px.set(0);
      py.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const el = svgRef.current;
      if (!el) return;
      const b = el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height * 0.4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      px.set((dx / d) * 9 * k);
      py.set((dy / d) * 6 * k);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [follow, px, py]);

  /* ---------- autonomous blink ---------- */
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 140);
          loop();
        },
        2600 + Math.random() * 2200,
      );
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  const canBlink = cfg.eyes === "open" || cfg.eyes === "wide" || cfg.eyes === "scan";
  const hands = HANDS[state];

  /* body motion per state */
  const bodyAnim = reduce
    ? { y: 0 }
    : state === "celebration"
      ? {
          y: [0, -22, 0],
          transition: { duration: 0.7, repeat: Infinity, ease: "easeOut" as const },
        }
      : state === "optimal"
        ? {
            y: [0, -8, 0],
            transition: { duration: 1, repeat: Infinity, ease: "easeInOut" as const },
          }
        : state === "critical_hitl_lock"
          ? { x: [0, -1.5, 1.5, 0], y: [0, -3, 0], transition: { duration: 0.5, repeat: Infinity } }
          : state === "fatigue_warning"
            ? {
                y: [0, 4, 0],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
              }
            : {
                y: [0, -6, 0],
                transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const },
              };

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 200 230"
      width={size}
      height={(size * 230) / 200}
      className={className}
      role="img"
      aria-label={title ?? `Pulsi – ${cfg.label}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`aura-${uid}`}>
          <stop offset="0%" stopColor={tone} stopOpacity="0.45" />
          <stop offset="70%" stopColor={tone} stopOpacity="0.08" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`shell-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--pulsi-shell-hi)" />
          <stop offset="100%" stopColor="var(--pulsi-shell)" />
        </linearGradient>
        <linearGradient id={`visor-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--pulsi-visor-hi)" />
          <stop offset="100%" stopColor="var(--pulsi-visor)" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`visorclip-${uid}`}>
          <rect x="52" y="62" width="96" height="58" rx="29" />
        </clipPath>
      </defs>

      {/* aura */}
      <motion.circle
        cx="100"
        cy="112"
        r="98"
        fill={`url(#aura-${uid})`}
        animate={reduce ? {} : { scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: cfg.beat * 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 112px" }}
      />

      {/* ground shadow */}
      <motion.ellipse
        cx="100"
        cy="218"
        rx="46"
        ry="6"
        fill="var(--pulsi-shadow)"
        animate={reduce ? {} : { scaleX: state === "celebration" ? [1, 0.6, 1] : [1, 0.88, 1] }}
        transition={{
          duration: state === "celebration" ? 0.7 : 3.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "100px 218px" }}
      />

      <motion.g animate={bodyAnim}>
        {/* pairing radar */}
        <AnimatePresence>
          {state === "pairing_sync" &&
            [0, 1, 2].map((i) => (
              <motion.circle
                key={`radar-${i}`}
                cx="100"
                cy="14"
                r="8"
                fill="none"
                stroke={tone}
                strokeWidth="2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 4], opacity: [0.9, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "100px 14px" }}
              />
            ))}
        </AnimatePresence>

        {/* head group with tilt */}
        <motion.g
          animate={{ rotate: HEAD_TILT[state] ?? 0 }}
          transition={spring}
          style={{ transformOrigin: "100px 130px" }}
        >
          {/* antenna */}
          <motion.path
            d="M100 40 Q 100 28 100 20"
            stroke="var(--pulsi-shell-edge)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="15"
            r="6.5"
            fill={tone}
            filter={`url(#glow-${uid})`}
            animate={reduce ? {} : { scale: [1, 1.25, 1] }}
            transition={{ duration: cfg.beat, repeat: Infinity }}
            style={{ transformOrigin: "100px 15px" }}
          />

          {/* body */}
          <rect
            x="64"
            y="132"
            width="72"
            height="66"
            rx="30"
            fill={`url(#shell-${uid})`}
            stroke="var(--pulsi-shell-edge)"
            strokeWidth="1.5"
          />
          {/* chest core */}
          <rect x="78" y="150" width="44" height="26" rx="13" fill="var(--pulsi-visor)" />
          <clipPath id={`chest-${uid}`}>
            <rect x="80" y="152" width="40" height="22" rx="11" />
          </clipPath>
          <g clipPath={`url(#chest-${uid})`}>
            <motion.path
              d="M70 163 H86 L90 156 L95 170 L99 158 L102 163 H130"
              fill="none"
              stroke={tone}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#glow-${uid})`}
              initial={{ pathLength: 0 }}
              animate={reduce ? { pathLength: 1 } : { pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
              transition={{ duration: cfg.beat, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>

          {/* head shell */}
          <rect
            x="34"
            y="40"
            width="132"
            height="100"
            rx="48"
            fill={`url(#shell-${uid})`}
            stroke="var(--pulsi-shell-edge)"
            strokeWidth="1.5"
          />
          {/* ear pods */}
          <rect x="26" y="76" width="12" height="28" rx="6" fill={tone} opacity="0.85" />
          <rect x="162" y="76" width="12" height="28" rx="6" fill={tone} opacity="0.85" />
          {/* highlight */}
          <path
            d="M56 52 Q 80 44 104 46"
            stroke="var(--pulsi-shell-hi)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />

          {/* visor */}
          <rect x="50" y="60" width="100" height="62" rx="31" fill={`url(#visor-${uid})`} />
          <g clipPath={`url(#visorclip-${uid})`}>
            {/* visor reflection */}
            <path
              d="M60 70 Q 90 62 120 66"
              stroke="var(--pulsi-shell-hi)"
              strokeWidth="3"
              opacity="0.15"
              fill="none"
              strokeLinecap="round"
            />
            {/* eyes */}
            <motion.g style={{ x: sx, y: sy }}>
              <Eyes
                shape={cfg.eyes}
                tone={tone}
                blink={blink && canBlink}
                glow={`url(#glow-${uid})`}
                reduce={!!reduce}
              />
            </motion.g>
            {/* scan line */}
            {state === "analyzing_whitebox" && !reduce && (
              <motion.rect
                x="52"
                width="96"
                height="2"
                fill={tone}
                opacity="0.5"
                animate={{ y: [64, 118, 64] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </g>

          {/* cheeks */}
          <AnimatePresence>
            {(cfg.eyes === "happy" || state === "welcome") && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ellipse cx="62" cy="126" rx="7" ry="3.5" fill="var(--pulsi-blush)" />
                <ellipse cx="138" cy="126" rx="7" ry="3.5" fill="var(--pulsi-blush)" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* sweat drop for fatigue */}
          <AnimatePresence>
            {state === "fatigue_warning" && (
              <motion.path
                d="M150 50 Q 156 60 150 64 Q 144 60 150 50 Z"
                fill="var(--pulsi-teal)"
                opacity="0.7"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: [0, 0.8, 0.8, 0], y: [-6, 0, 10, 16] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </motion.g>

        {/* hands */}
        {hands.map((h, i) => (
          <motion.g
            key={i}
            initial={false}
            animate={{ x: h.x, y: h.y, rotate: h.r }}
            transition={spring}
          >
            <motion.g
              animate={
                !reduce && state === "welcome" && i === 1
                  ? { rotate: [0, -28, 10, -28, 0] }
                  : !reduce && state === "celebration"
                    ? { rotate: [0, i ? -20 : 20, 0] }
                    : { rotate: 0 }
              }
              transition={{
                duration: state === "celebration" ? 0.7 : 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <rect
                x="-10"
                y="-17"
                width="20"
                height="34"
                rx="10"
                fill={`url(#shell-${uid})`}
                stroke="var(--pulsi-shell-edge)"
                strokeWidth="1.5"
              />
              <rect x="-5" y="-11" width="10" height="5" rx="2.5" fill={tone} opacity="0.7" />
            </motion.g>
          </motion.g>
        ))}

        {/* state props */}
        <AnimatePresence mode="popLayout">
          {state === "privacy_shield" && (
            <motion.g
              key="lock"
              initial={{ opacity: 0, scale: 0.4, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={spring}
              style={{ transformOrigin: "100px 34px" }}
            >
              <g filter={`url(#glow-${uid})`}>
                <rect
                  x="89"
                  y="24"
                  width="22"
                  height="17"
                  rx="4"
                  fill="none"
                  stroke={tone}
                  strokeWidth="2.4"
                />
                <path
                  d="M93 24 v-5 a7 7 0 0 1 14 0 v5"
                  fill="none"
                  stroke={tone}
                  strokeWidth="2.4"
                />
                <circle cx="100" cy="32.5" r="2.4" fill={tone} />
              </g>
            </motion.g>
          )}
          {state === "critical_hitl_lock" && (
            <motion.g
              key="shield"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={spring}
              style={{ transformOrigin: "140px 168px" }}
            >
              <path
                d="M140 146 L160 153 V168 Q160 184 140 192 Q120 184 120 168 V153 Z"
                fill="var(--pulsi-crimson)"
                stroke="var(--pulsi-shell-hi)"
                strokeWidth="2"
              />
              <path
                d="M140 160 V178 M131 169 H149"
                stroke="var(--pulsi-shell-hi)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </motion.g>
          )}
          {state === "puzzled" && (
            <motion.text
              key="q"
              x="150"
              y="40"
              fontSize="30"
              fontWeight="800"
              fill={tone}
              fontFamily="inherit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ y: { duration: 1.6, repeat: Infinity } }}
            >
              ?
            </motion.text>
          )}
          {state === "analyzing_whitebox" && !reduce && (
            <motion.g
              key="dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={160 + i * 9}
                  cy="38"
                  r="3"
                  fill={tone}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.g>
          )}
          {state === "celebration" && !reduce && (
            <motion.g
              key="spark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {(
                [
                  [30, 40],
                  [170, 36],
                  [20, 110],
                  [182, 108],
                  [60, 18],
                  [142, 14],
                ] as [number, number][]
              ).map(([x, y], i) => (
                <motion.path
                  key={i}
                  d={`M${x} ${y - 6} L${x + 1.5} ${y - 1.5} L${x + 6} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 6} L${x - 1.5} ${y + 1.5} L${x - 6} ${y} L${x - 1.5} ${y - 1.5} Z`}
                  fill={i % 2 ? "var(--pulsi-amber)" : tone}
                  animate={{ scale: [0, 1.2, 0], rotate: [0, 90] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              ))}
            </motion.g>
          )}
          {state === "security_guard" && (
            <motion.g
              key="ban"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={spring}
              style={{ transformOrigin: "164px 34px" }}
            >
              <circle
                cx="164"
                cy="34"
                r="11"
                fill="none"
                stroke="var(--pulsi-crimson)"
                strokeWidth="3"
              />
              <path
                d="M156 42 L172 26"
                stroke="var(--pulsi-crimson)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </motion.g>
          )}
        </AnimatePresence>
      </motion.g>
    </motion.svg>
  );
}

function Eyes({
  shape,
  tone,
  blink,
  glow,
  reduce,
}: {
  shape: string;
  tone: string;
  blink: boolean;
  glow: string;
  reduce: boolean;
}) {
  const eye = (cx: number) => {
    const o = { transformOrigin: `${cx}px 91px` };
    switch (shape) {
      case "happy":
        return (
          <path
            d={`M${cx - 10} 95 Q ${cx} 80 ${cx + 10} 95`}
            stroke={tone}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "drowsy":
        return (
          <g>
            <ellipse cx={cx} cy="94" rx="9" ry="6" fill={tone} />
            <rect x={cx - 12} y="83" width="24" height="9" fill="var(--pulsi-visor)" />
            <path
              d={`M${cx - 11} 92 H${cx + 11}`}
              stroke={tone}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        );
      case "flat":
        return <rect x={cx - 11} y="88" width="22" height="5" rx="2.5" fill={tone} />;
      case "hidden":
        return null;
      default: {
        const rx = shape === "wide" ? 11 : 9;
        const ry = shape === "wide" ? 14 : 12;
        return (
          <motion.g
            animate={{ scaleY: blink ? 0.08 : 1 }}
            transition={{ duration: 0.08 }}
            style={o}
          >
            <motion.g
              animate={shape === "scan" && !reduce ? { x: [-7, 7, -7] } : { x: 0 }}
              transition={{
                duration: 1.6,
                repeat: shape === "scan" ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <ellipse cx={cx} cy="91" rx={rx} ry={ry} fill={tone} />
              <circle
                cx={cx + 3}
                cy="86"
                r={shape === "wide" ? 3.5 : 3}
                fill="var(--pulsi-shell-hi)"
                opacity="0.9"
              />
              {shape === "wide" && <circle cx={cx} cy="91" r="4" fill="var(--pulsi-visor)" />}
            </motion.g>
          </motion.g>
        );
      }
    }
  };
  return (
    <AnimatePresence mode="wait">
      <motion.g
        key={shape}
        filter={glow}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.18 }}
        style={{ transformOrigin: "100px 91px" }}
      >
        {eye(80)}
        {eye(120)}
      </motion.g>
    </AnimatePresence>
  );
}
