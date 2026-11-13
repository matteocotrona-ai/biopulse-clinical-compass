import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

/** Fades/blur-rises children in sequence when the group scrolls into view. */
export function Stagger({
  children,
  delay = 0,
  gap = 0.08,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  gap?: number;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={"hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

export function Item({ children, className, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={item} {...rest}>
      {children}
    </motion.div>
  );
}

/** Single element reveal on scroll. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Splits a headline into words that rise in one after another. */
export function RiseText({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pt-[0.04em] pb-[0.2em] -mb-[0.1em] align-top">
          <motion.span
            className={wordClassName ? `inline-block ${wordClassName}` : "inline-block"}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: delay + i * 0.06, ease: EASE }}
          >
            {word}
            {"\u00a0"}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
