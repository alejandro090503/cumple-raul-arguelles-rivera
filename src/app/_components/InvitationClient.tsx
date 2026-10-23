"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionConfig,
  type Variants,
} from "framer-motion";
import { RSVPClient } from "./RSVPClient";
import { FloatingMenu } from "./FloatingMenu";

const C = {
  black: "#14275E",      // zafiro profundo (texto principal)
  white: "#FFFFFF",
  gold: "#A8841F",       // oro legible sobre blanco
  goldLight: "#D4AF37",  // dorado del cliente
  charcoal: "#1E3A8A",   // zafiro del cliente
  gray: "#3E4A6B",
  softGray: "#5B6684",
  cream: "#FFFFFF",
  border: "#D9DEEA",
  navy: "#0B1A3D",
};

/* ═══════════════════════════════════════════════════════
   SISTEMA DE ANIMACIÓN (Framer Motion)
   ═══════════════════════════════════════════════════════ */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rise: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};
const riseSmall: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease: EASE } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 26 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
const drawX: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
};
const popStar: Variants = {
  hidden: { scale: 0, rotate: -90, opacity: 0 },
  show: { scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

function group(staggerChildren = 0.12, delayChildren = 0): Variants {
  return { hidden: {}, show: { transition: { staggerChildren, delayChildren } } };
}

function InView({
  children,
  variants = group(0.12),
  amount = 0.25,
  style,
  className,
  id,
}: {
  children: React.ReactNode;
  variants?: Variants;
  amount?: number;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

function MaskLine({
  as: Tag = "span",
  children,
  style,
  duration = 0.95,
  delay = 0,
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
}) {
  return (
    <Tag style={{ display: "block", overflow: "hidden", ...style }}>
      <motion.span
        style={{ display: "block", willChange: "transform" }}
        variants={{
          hidden: { y: "115%" },
          show: { y: "0%", transition: { duration, ease: EASE, delay } },
        }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

function WordReveal({ text, style }: { text: string; style?: React.CSSProperties }) {
  const words = text.split(" ");
  return (
    <motion.p style={style} variants={group(0.045)}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
          }}
        >
          {w + (i < words.length - 1 ? " " : "")}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* ─── Countdown ─── */
function Countdown() {
  const target = new Date("2027-01-02T18:00:00-07:00").getTime();
  const [now, setNow] = useState(target);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const units = [
    { val: days, label: "Días" },
    { val: hours, label: "Horas" },
    { val: mins, label: "Min" },
    { val: secs, label: "Seg" },
  ];

  return (
    <motion.div className="flex items-center justify-center" variants={group(0.09)}>
      {units.map((u, i) => (
        <motion.div key={u.label} className="flex items-center" variants={riseSmall}>
          <div className="flex flex-col items-center" style={{ minWidth: 58 }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 34,
                color: C.charcoal,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(u.val).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: 14,
                fontWeight: 600,
                color: C.gray,
                letterSpacing: "0.06em",
                marginTop: 8,
              }}
            >
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <div
              style={{
                width: 1,
                height: 24,
                backgroundColor: C.gold,
                opacity: 0.3,
                marginLeft: 4,
                marginRight: 4,
              }}
              aria-hidden="true"
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─── Ornament animado ─── */
function Ornament({ width = 100 }: { width?: number }) {
  return (
    <motion.div className="flex items-center justify-center gap-3 my-2" variants={fade}>
      <motion.div
        style={{ height: 1, width: width / 2, backgroundColor: C.gold, opacity: 0.45, transformOrigin: "right" }}
        variants={drawX}
      />
      <motion.svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" variants={popStar}>
        <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill={C.gold} opacity="0.55" />
      </motion.svg>
      <motion.div
        style={{ height: 1, width: width / 2, backgroundColor: C.gold, opacity: 0.45, transformOrigin: "left" }}
        variants={drawX}
      />
    </motion.div>
  );
}

function Divider() {
  return (
    <motion.div
      className="flex items-center justify-center"
      style={{ backgroundColor: "transparent", paddingTop: 24, paddingBottom: 24 }}
      variants={group(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.div
        style={{ height: 1, width: 56, backgroundColor: C.gold, opacity: 0.3, transformOrigin: "right" }}
        variants={drawX}
      />
      <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-3" variants={popStar}>
        <circle cx="12" cy="12" r="1.2" fill={C.gold} opacity="0.7" />
        <circle cx="12" cy="12" r="4.5" stroke={C.gold} strokeWidth="0.5" opacity="0.4" />
      </motion.svg>
      <motion.div
        style={{ height: 1, width: 56, backgroundColor: C.gold, opacity: 0.3, transformOrigin: "left" }}
        variants={drawX}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FOTO CON MARCO — aparece al scroll con brillo
   ═══════════════════════════════════════════════════════ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PhotoFrame({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <motion.div
      style={{
        backgroundColor: C.cream,
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 24,
        paddingRight: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={group(0.15)}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50, scale: 0.92, rotate: -2 },
          show: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            transition: { duration: 1, ease: EASE },
          },
        }}
        style={{ position: "relative" }}
      >
        {/* Marco blanco tipo Polaroid */}
        <div
          style={{
            background: C.white,
            padding: "14px 14px 48px 14px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.08)",
            maxWidth: 280,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Brillo que se desliza */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.6) 55%, transparent 60%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
            initial={{ x: "-100%" }}
            whileInView={{ x: "200%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.6, ease: "easeInOut" }}
          />
          <img
            src={src}
            alt={alt}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              aspectRatio: "3/4",
              objectFit: "cover",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "clamp(16px, 4vw, 22px)",
              color: C.charcoal,
              textAlign: "center",
              marginTop: 14,
              lineHeight: 1.3,
            }}
          >
            {caption}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   VINYL MUSIC BUTTON — disco de vinilo flotante
   ═══════════════════════════════════════════════════════ */
function VinylButton() {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onRevealed = () => setReady(true);
    window.addEventListener("invitation:revealed", onRevealed);
    const t = setTimeout(onRevealed, 7000);
    return () => {
      window.removeEventListener("invitation:revealed", onRevealed);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    if (!audio.paused) setPlaying(true);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label="Controlar música"
      style={{
        position: "fixed",
        bottom: 96,
        right: 18,
        zIndex: 9000,
        width: 64,
        height: 64,
        borderRadius: "50%",
        padding: 0,
        border: "none",
        cursor: "pointer",
        background: "transparent",
        opacity: ready ? 1 : 0,
        transform: ready ? "scale(1)" : "scale(0.6)",
        pointerEvents: ready ? "auto" : "none",
        transition: "transform 0.35s cubic-bezier(.2,.7,.2,1), opacity 0.35s ease",
        boxShadow: "0 4px 18px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.15)",
      }}
    >
      {/* Tonearm */}
      <div
        style={{
          position: "absolute",
          top: -4,
          right: -2,
          width: 22,
          height: 32,
          transformOrigin: "top right",
          transform: playing ? "rotate(-12deg)" : "rotate(-28deg)",
          transition: "transform 0.6s cubic-bezier(.2,.7,.2,1)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 2, width: 7, height: 7, background: `radial-gradient(circle, ${C.goldLight}, ${C.gold})`, borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
        <div style={{ position: "absolute", top: 2, right: 4, width: 2, height: 26, background: `linear-gradient(to bottom, ${C.gold}, ${C.goldLight})`, borderRadius: 1, transform: "rotate(-5deg)", transformOrigin: "top center" }} />
        <div style={{ position: "absolute", bottom: 0, right: 2, width: 5, height: 6, background: C.gold, borderRadius: "0 0 2px 2px" }} />
      </div>

      {/* Disco */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          position: "relative",
          animation: playing ? "vinylSpin 1.8s linear infinite" : "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            background: `
              radial-gradient(circle, #0B1A3D 4%, transparent 4.5%),
              radial-gradient(circle, ${C.gold} 0%, #6B5A3A 17%, #2C2418 19%, transparent 19.5%),
              repeating-radial-gradient(circle,
                transparent 20%, rgba(255,255,255,0.055) 20.8%, transparent 21.5%,
                transparent 24%, rgba(255,255,255,0.04) 24.8%, transparent 25.5%,
                transparent 28%, rgba(255,255,255,0.055) 28.8%, transparent 29.5%,
                transparent 32%, rgba(255,255,255,0.04) 32.8%, transparent 33.5%,
                transparent 36%, rgba(255,255,255,0.055) 36.8%, transparent 37.5%,
                transparent 40%, rgba(255,255,255,0.04) 40.8%, transparent 41.5%,
                transparent 44%, rgba(255,255,255,0.055) 44.8%, transparent 45.5%,
                transparent 48%, rgba(255,255,255,0.04) 48.8%, transparent 49.5%
              ),
              radial-gradient(circle, #0B1A3D 0%, #14275E 60%, #0B1A3D 100%)
            `,
            boxShadow: "inset 0 0 8px rgba(0,0,0,.4)",
          }}
        >
          {/* Sheen */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,.09) 42%, rgba(255,255,255,.15) 48%, rgba(255,255,255,.09) 54%, transparent 66%)", pointerEvents: "none" }} />
          {/* Label */}
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--font-script)", fontSize: 10, color: C.gold, textAlign: "center", lineHeight: 1.1, opacity: 0.8, pointerEvents: "none", width: 24 }}>
            RA<br /><span style={{ fontFamily: "var(--font-body)", fontSize: 5, letterSpacing: "0.15em", opacity: 0.6 }}>50</span>
          </span>
          {/* Hole */}
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 5, height: 5, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#0B1A3D", boxShadow: `0 0 0 1.5px ${C.gold}55` }} />
        </div>
      </div>

      {/* Play/Pause icon */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, pointerEvents: "none", zIndex: 2 }}>
        {playing ? (
          <svg viewBox="0 0 24 24" fill={C.gold} aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill={C.gold} aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        )}
      </div>

      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          inset: -5,
          borderRadius: "50%",
          border: `1px solid ${C.gold}`,
          opacity: 0.3,
          animation: playing ? "vinylPulse 1.6s ease-in-out infinite" : "vinylPulse 3s ease-in-out infinite",
        }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO — tipografía animada + parallax + textos brillantes
   ═══════════════════════════════════════════════════════ */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yContent = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    let fired = false;
    const on = () => {
      if (!fired) {
        fired = true;
        setRevealed(true);
      }
    };
    window.addEventListener("invitation:revealed", on);
    const t = setTimeout(on, 6500);
    return () => {
      window.removeEventListener("invitation:revealed", on);
      clearTimeout(t);
    };
  }, []);

  const nameStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "clamp(3rem, 15vw, 8rem)",
    letterSpacing: "0.14em",
    color: C.black,
    lineHeight: 1,
    textAlign: "center",
    margin: 0,
  };

  return (
    <section
      ref={ref}
      className="flex flex-col items-center text-center fx ink-hero halo"
      style={{
        minHeight: "100dvh",
        justifyContent: "center",
        paddingTop: "clamp(80px, 14vh, 120px)",
        paddingBottom: "clamp(60px, 10vh, 100px)",
        paddingLeft: 24,
        paddingRight: 24,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Partículas de brillo decorativas */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            backgroundColor: C.gold,
            opacity: 0.3,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [0.8, 1.5, 0.8],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.7,
          }}
        />
      ))}

      <motion.div
        style={{ y: yContent, opacity, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "clamp(18px, 3.5vw, 30px)" }}
        variants={group(0.18, 0.1)}
        initial="hidden"
        animate={revealed ? "show" : "hidden"}
      >
        {/* Eyebrow */}
        <motion.p
          variants={riseSmall}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "clamp(13px, 3.4vw, 15px)",
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: C.gold,
            textAlign: "center",
          }}
        >
          Con gratitud y alegría
        </motion.p>

        {/* JAVIER — con shimmer */}
        <MaskLine as="h1" style={nameStyle} duration={1.05}>
          <span className="text-shimmer">RAÚL</span>
        </MaskLine>

        {/* 60 */}
        <motion.p
          aria-hidden="true"
          variants={{
            hidden: { opacity: 0, scale: 0.3, rotate: -8 },
            show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 130, damping: 12, mass: 0.7 } },
          }}
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "clamp(5rem, 20vw, 10rem)",
            color: C.gold,
            lineHeight: 0.85,
            textShadow: `0 0 30px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.15)`,
          }}
        >
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
          >
            50
          </motion.span>
        </motion.p>

        {/* ZAMUDIO — con shimmer */}
        <MaskLine as="h1" style={{ ...nameStyle, fontSize: "clamp(1.35rem, 6.4vw, 4rem)", letterSpacing: "0.06em", whiteSpace: "nowrap" }} duration={1.05}>
          <span className="text-shimmer">ARGÜELLES RIVERA</span>
        </MaskLine>

        <Ornament width={120} />

        {/* Texto invitación */}
        <motion.p
          variants={rise}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "clamp(14px, 3.6vw, 16px)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.charcoal,
            lineHeight: 2,
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          Te invitamos a celebrar
          <br />
          sus cincuenta años de vida
        </motion.p>

        {/* Fecha grande */}
        <motion.div variants={rise} style={{ textAlign: "center" }}>
          <p
            className="text-shimmer"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "clamp(2.2rem, 10vw, 5.5rem)",
              letterSpacing: "0.06em",
              color: C.black,
              lineHeight: 1,
              margin: 0,
            }}
          >
            ENERO 2
          </p>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "clamp(2.2rem, 10vw, 5.5rem)",
              letterSpacing: "0.06em",
              color: C.black,
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            2027
          </p>
        </motion.div>

        {/* Línea vertical */}
        <motion.div
          aria-hidden="true"
          variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.7, ease: EASE } } }}
          style={{
            width: 1,
            height: "clamp(36px, 6vw, 52px)",
            backgroundColor: C.gold,
            opacity: 0.4,
            transformOrigin: "top",
          }}
        />

        {/* Lugar */}
        <motion.p
          variants={rise}
          style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(18px, 4.6vw, 21px)",
            color: C.gray,
            textAlign: "center",
          }}
        >
          Sábado · Phoenix, Arizona
        </motion.p>

        <Countdown />
      </motion.div>
    </section>
  );
}

/* ─── Section wrapper ─── */
function Section({
  id,
  children,
  bg = C.cream,
  style: styleProp,
  className = "",
}: {
  className?: string;
  id?: string;
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      className={`text-center ${className}`}
      style={{
        backgroundColor: bg,
        paddingTop: 88,
        paddingBottom: 88,
        paddingLeft: 24,
        paddingRight: 24,
        ...styleProp,
      }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <>
      {eyebrow && (
        <motion.p
          variants={riseSmall}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: C.gold,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </motion.p>
      )}
      <MaskLine
        as="h2"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(2rem, 9vw, 3.6rem)",
          letterSpacing: "0.05em",
          color: C.black,
          lineHeight: 1.12,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        {title}
      </MaskLine>
      <div style={{ marginBottom: 36 }}>
        <Ornament width={100} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MENSAJE
   ═══════════════════════════════════════════════════════ */
function Mensaje() {
  return (
    <Section className="fx ink-oval halo" bg="transparent" style={{ minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 56, paddingRight: 56 }}>
      <InView style={{ maxWidth: 460, margin: "0 auto" }} amount={0.35}>
        <WordReveal
          text="Medio siglo de vida, de trabajo y de cariño. Con el corazón agradecido, tenemos el honor de invitarte a celebrar los 50 años de Raúl Argüelles Rivera"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
            color: C.charcoal,
            lineHeight: 1.9,
            textAlign: "center",
          }}
        />
      </InView>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   LA CELEBRACIÓN
   ═══════════════════════════════════════════════════════ */
function Ceremonia() {
  return (
    <Section id="ceremonia" className="fx mesh mesh-a halo" bg="transparent">
      <InView style={{ maxWidth: 460, margin: "0 auto" }} amount={0.25}>
        <SectionTitle eyebrow="Recepción" title="LA CELEBRACIÓN" />

        <motion.p
          variants={rise}
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: 30,
            color: C.black,
            letterSpacing: "0.04em",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          6:00 p.m.
        </motion.p>

        <motion.p
          variants={rise}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 18,
            color: C.gray,
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Eduardo&apos;s Reception Hall
          <br />
          7533 W Thomas Rd · Phoenix, AZ 85033
        </motion.p>

        <motion.div variants={rise} style={{ textAlign: "center" }}>
          <motion.a
            href="https://maps.app.goo.gl/HxuFVTX2KBa8Hs5f9"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.black,
              textDecoration: "none",
              paddingBottom: 6,
              borderBottom: `1px solid ${C.gold}`,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Ver ubicación
          </motion.a>
        </motion.div>

        <motion.div
          variants={scaleIn}
          animate={{ boxShadow: ["0 0 0 rgba(212,175,55,0)", "0 0 26px rgba(212,175,55,0.28)", "0 0 0 rgba(212,175,55,0)"] }}
          transition={{ boxShadow: { duration: 3.4, ease: "easeInOut", repeat: Infinity } }}
          style={{
            marginTop: 40,
            border: `1px solid ${C.gold}`,
            backgroundColor: C.white,
            padding: "26px 24px",
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: C.gold,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Muy importante
          </p>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "clamp(1.3rem, 6vw, 1.7rem)",
              letterSpacing: "0.04em",
              color: C.black,
              lineHeight: 1.3,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Evento solo para adultos
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 16, color: C.gray, textAlign: "center", lineHeight: 1.6 }}>
            Agradecemos tu comprensión.
          </p>
        </motion.div>
      </InView>
    </Section>
  );
}

/* ─── Sketch icons ─── */
function IconCoctel() {
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.black} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 18 L40 52 L64 18 Z" />
      <line x1="40" y1="52" x2="40" y2="68" />
      <line x1="30" y1="68" x2="50" y2="68" />
      <circle cx="52" cy="30" r="4" />
      <line x1="56" y1="26" x2="62" y2="20" />
      <path d="M22 28 Q40 34 58 28" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  );
}
function IconRecepcion() {
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.black} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 16 Q20 32 28 40 L28 62" />
      <path d="M24 16 Q28 32 28 40" />
      <line x1="20" y1="62" x2="36" y2="62" />
      <path d="M56 16 Q52 32 52 40 L52 62" />
      <path d="M56 16 Q60 32 52 40" />
      <line x1="44" y1="62" x2="60" y2="62" />
      <circle cx="26" cy="28" r="1.2" fill={C.black} opacity="0.5" />
      <circle cx="28" cy="22" r="0.9" fill={C.black} opacity="0.5" />
      <circle cx="54" cy="26" r="1.2" fill={C.black} opacity="0.5" />
      <circle cx="56" cy="20" r="0.9" fill={C.black} opacity="0.5" />
      <path d="M28 40 Q40 35 52 40" />
    </svg>
  );
}
function IconCena() {
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.black} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="26" y1="16" x2="26" y2="64" />
      <line x1="20" y1="16" x2="20" y2="32" />
      <line x1="26" y1="16" x2="26" y2="32" />
      <line x1="32" y1="16" x2="32" y2="32" />
      <path d="M20 32 Q26 38 32 32" />
      <line x1="54" y1="16" x2="54" y2="64" />
      <path d="M54 16 Q62 24 54 38" />
    </svg>
  );
}
function IconBaile() {
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.black} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="44" y1="18" x2="44" y2="54" />
      <line x1="44" y1="18" x2="64" y2="14" />
      <line x1="64" y1="14" x2="64" y2="50" />
      <ellipse cx="38" cy="56" rx="8" ry="5" transform="rotate(-15 38 56)" />
      <ellipse cx="58" cy="52" rx="8" ry="5" transform="rotate(-15 58 52)" />
      <text x="14" y="38" fontSize="16" fontFamily="serif" fill={C.black} stroke="none" opacity="0.25">♩</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   ITINERARIO
   ═══════════════════════════════════════════════════════ */
function Itinerario() {
  const items: { hora: string; evento: string; icon: React.ReactNode; extra?: React.ReactNode }[] = [
    {
      hora: "6:00 p.m.",
      evento: "RECEPCIÓN",
      icon: <IconRecepcion />,
      extra: (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: C.gray, textAlign: "center", marginBottom: 10 }}>
            Eduardo&apos;s Reception Hall
          </p>
          <motion.a
            href="https://maps.app.goo.gl/HxuFVTX2KBa8Hs5f9"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, textDecoration: "none" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Ver en mapa
          </motion.a>
        </div>
      ),
    },
    { hora: "Por confirmar", evento: "CENA", icon: <IconCena /> },
    { hora: "Por confirmar", evento: "BRINDIS", icon: <IconCoctel /> },
    { hora: "Por confirmar", evento: "BAILE", icon: <IconBaile /> },
  ];

  return (
    <Section id="itinerario" className="fx ink-soft halo" bg="transparent">
      <InView amount={0.3}>
        <SectionTitle title="ITINERARIO" />
      </InView>

      <div style={{ maxWidth: 320, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
            variants={group(0.14)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
          >
            <motion.div
              variants={{
                hidden: { scale: 0.4, opacity: 0, rotate: -6 },
                show: { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 160, damping: 13 } },
              }}
            >
              {item.icon}
            </motion.div>

            <MaskLine
              as="h3"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 7vw, 2.4rem)",
                letterSpacing: "0.08em",
                color: C.black,
                textAlign: "center",
                marginTop: 8,
                marginBottom: 6,
              }}
            >
              {item.evento}
            </MaskLine>

            <motion.p
              variants={riseSmall}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 18,
                color: C.charcoal,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              {item.hora}
            </motion.p>

            {item.extra && <motion.div variants={riseSmall}>{item.extra}</motion.div>}

            {i < items.length - 1 && (
              <motion.div
                aria-hidden="true"
                variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.55, ease: EASE } } }}
                style={{ width: 1, height: 52, backgroundColor: C.black, opacity: 0.18, margin: "20px auto", transformOrigin: "top" }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   VESTIMENTA
   ═══════════════════════════════════════════════════════ */
function Vestimenta() {
  const LOOKS = {
    caballeros: { head: "Caballeros", src: "/look-caballero.png", cap: "Traje oscuro · negro" },
    damas: { head: "Damas", src: "/look-dama.png", cap: "Vestido largo en tono oscuro" },
  } as const;
  const [open, setOpen] = useState<null | keyof typeof LOOKS>(null);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [open]);
  const ico = {
    caballeros: <path d="M8 3l4 3 4-3 3 2.2c1.2.9 1.9 2.3 1.9 3.8V21H3V9c0-1.5.7-2.9 1.9-3.8L8 3zM12 6v15M9.4 4.2L12 9l2.6-4.8" />,
    damas: <path d="M9 3h6l-1.4 5.2L21 21H3l7.4-12.8L9 3zM10.6 8.2h2.8" />,
  };
  return (
    <Section id="vestimenta" className="fx mesh mesh-b halo" bg="transparent">
      <InView style={{ maxWidth: 400, margin: "0 auto" }} amount={0.3}>
        <SectionTitle eyebrow="Código de vestimenta" title="FORMAL" />
        <motion.p variants={rise} style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontWeight: 600, fontSize: "clamp(1.2rem, 4.8vw, 1.4rem)", color: C.gray, marginBottom: 10 }}>
          Acompáñanos vestido para la ocasión
        </motion.p>
        <motion.div variants={rise} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#000", boxShadow: "0 0 0 2px #fff, 0 0 0 3px rgba(168,132,31,.7)" }} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, letterSpacing: "0.14em", textTransform: "uppercase", color: C.charcoal }}>Color sugerido: negro</span>
        </motion.div>
        <motion.div variants={rise} className="dc-looks">
          {(Object.keys(LOOKS) as (keyof typeof LOOKS)[]).map((k) => (
            <button key={k} type="button" className="dc-look" onClick={() => setOpen(k)} aria-label={`Ver ideas de vestimenta para ${LOOKS[k].head.toLowerCase()}`}>
              <span className="dc-look-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ico[k]}</svg>
              </span>
              <span className="dc-look-txt">
                <span className="dc-look-rol">{LOOKS[k].head}</span>
                <span className="dc-look-cta">Ver ideas</span>
              </span>
              <span className="dc-look-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </span>
            </button>
          ))}
        </motion.div>
      </InView>

      {open && (
        <div className="dc-viewer on" role="dialog" aria-modal="true" aria-label="Ideas de vestimenta" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="dcv-box">
            <button className="dc-viewer-close" type="button" aria-label="Cerrar" onClick={() => setOpen(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <p className="dcv-head">{LOOKS[open].head}</p>
            <div className="dcv-viewport">
              <div className="dcv-track">
                <figure className="dcv-slide">
                  <div className="dcv-frame"><div className="dcv-mat">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={LOOKS[open].src} alt={`${LOOKS[open].head} — ${LOOKS[open].cap}`} />
                  </div></div>
                </figure>
              </div>
            </div>
            <p className="dcv-cap">{LOOKS[open].cap}</p>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   ES UNA SORPRESA — más llamativa y viva
   ═══════════════════════════════════════════════════════ */
function AvisoSorpresa() {
  return (
    <Section bg="transparent" className="fx ink-dark halo-dark" style={{ position: "relative", overflow: "hidden", paddingTop: 230, paddingBottom: 260 }}>
      {/* Partículas doradas flotantes */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: i % 3 === 0 ? 4 : 2,
            height: i % 3 === 0 ? 4 : 2,
            borderRadius: "50%",
            backgroundColor: C.goldLight,
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${10 + (i * 13) % 80}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -30, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 3 + (i % 4) * 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}

      <InView
        style={{
          maxWidth: 420,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          position: "relative",
          zIndex: 1,
        }}
        amount={0.4}
      >
        {/* Ícono "shh" grande con pulse */}
        <motion.div
          variants={popStar}
          style={{ position: "relative" }}
        >
          {/* Rings pulsantes */}
          <motion.div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              border: `1px solid ${C.gold}`,
              opacity: 0.2,
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{
              position: "absolute",
              inset: -35,
              borderRadius: "50%",
              border: `1px solid ${C.gold}`,
              opacity: 0.1,
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `1.5px solid ${C.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(212,175,55,0.08)",
            }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 34, lineHeight: 1, color: C.goldLight }}>50</span>
          </motion.div>
        </motion.div>

        <motion.h2
          variants={rise}
          className="text-shimmer-light"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "clamp(1.8rem, 8vw, 2.8rem)",
            letterSpacing: "0.1em",
            color: C.white,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          MEDIO SIGLO
        </motion.h2>

        <motion.div
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease: EASE } } }}
          style={{ height: 1, width: 60, backgroundColor: C.gold, opacity: 0.5 }}
        />

        <motion.p
          variants={rise}
          style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(16px, 4.2vw, 19px)",
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.8,
            textAlign: "center",
            maxWidth: 340,
          }}
        >
          Cincuenta años de historia merecen celebrarse
          <br />
          con quienes han sido parte de ella.
        </motion.p>

        <motion.p
          variants={riseSmall}
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.gold,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Gracias por acompañarlo
        </motion.p>
      </InView>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   LLUVIA DE SOBRES — sobre interactivo estilo boda-jennifer
   ═══════════════════════════════════════════════════════ */
function MesaRegalos() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Section id="regalos" className="fx ink-soft ink-soft-b halo" bg="transparent">
      <InView amount={0.25}>
        <SectionTitle eyebrow="Sugerencia de regalo" title="LLUVIA DE SOBRES" />
        <motion.p variants={rise} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 18, color: C.gray, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 32px" }}>
          Tu presencia es el mejor regalo. Si deseas tener un detalle, habrá un buzón para sobres en la recepción.
        </motion.p>
        
        {/* Sobre interactivo */}
        <motion.div variants={scaleIn} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Sobre — toca para abrir"
            aria-expanded={isOpen}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              outline: "none",
              border: "none",
              background: "none",
              padding: 0,
            }}
          >
            {/* Cuerpo del sobre */}
            <div style={{ perspective: 700, position: "relative", width: 260, height: 200 }}>
              <motion.div
                animate={isOpen ? {} : { scale: [1, 1.03, 1] }}
                transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
              >
                <svg viewBox="0 0 260 200" preserveAspectRatio="none" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
                  <defs>
                    <linearGradient id="env-fill" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F5EFDF" />
                      <stop offset="100%" stopColor="#FAF8F2" />
                    </linearGradient>
                  </defs>
                  <rect x="18" y="52" width="224" height="132" rx="10" fill="url(#env-fill)" stroke={`${C.gold}55`} strokeWidth="1.4" />
                  <path d="M18 184 L130 110 L242 184" stroke={`${C.gold}44`} strokeWidth="1" fill="none" />
                  <line x1="90" y1="30" x2="90" y2="20" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity=".35" />
                  <line x1="130" y1="24" x2="130" y2="14" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity=".5" />
                  <line x1="170" y1="30" x2="170" y2="20" stroke={C.gold} strokeWidth="1.3" strokeLinecap="round" opacity=".35" />
                  <line x1="110" y1="18" x2="110" y2="10" stroke={C.goldLight} strokeWidth="1" strokeLinecap="round" opacity=".3" />
                  <line x1="150" y1="18" x2="150" y2="10" stroke={C.goldLight} strokeWidth="1" strokeLinecap="round" opacity=".3" />
                  <circle cx="130" cy="118" r="16" fill={`${C.gold}18`} stroke={`${C.gold}55`} strokeWidth="1" />
                  <text x="130" y="123" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" fill={C.black} opacity=".85">RA</text>
                </svg>
              </motion.div>

              {/* Solapa animable */}
              <div
                style={{
                  position: "absolute",
                  top: 46,
                  left: 18,
                  width: 224,
                  height: 86,
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  transition: "transform 0.65s cubic-bezier(.4,0,.2,1)",
                  pointerEvents: "none",
                  zIndex: 2,
                  transform: isOpen ? "rotateX(-175deg)" : "rotateX(0deg)",
                }}
              >
                <svg viewBox="0 0 224 86" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <defs>
                    <linearGradient id="flap-fill" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor={C.goldLight} />
                      <stop offset="100%" stopColor="#F5EFDF" />
                    </linearGradient>
                  </defs>
                  <path d="M0 0 L112 86 L224 0 Z" fill="url(#flap-fill)" stroke={`${C.gold}55`} strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

          </button>
        </motion.div>
      </InView>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <motion.section
      className="text-center fx ink-dark ink-dark-end halo-dark" style={{ backgroundColor: "transparent", paddingTop: 190, paddingBottom: 72, paddingLeft: 24, paddingRight: 24 }}
      variants={group(0.14)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.p
        aria-hidden="true"
        variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE } } }}
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: C.goldLight,
          fontSize: "clamp(2.6rem, 9vw, 4.4rem)",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        RA
      </motion.p>

      <motion.div
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease: EASE } } }}
        style={{ height: 1, width: 36, backgroundColor: "rgba(255,255,255,0.25)", margin: "24px auto" }}
      />

      <motion.p
        variants={riseSmall}
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.white,
          textAlign: "center",
        }}
      >
        02 · Enero · 2027
      </motion.p>

      <motion.p
        variants={riseSmall}
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: 13,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          textAlign: "center",
          marginTop: 14,
        }}
      >
        @elysium.invitaciones
      </motion.p>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export function InvitationClient({ pases, nombre }: { pases: number; nombre: string }) {
  useEffect(() => {
    let fired = false;
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.appendChild(sentinel);
    const io = new IntersectionObserver(() => {
      fired = true;
      cleanup();
    });
    const cleanup = () => {
      io.disconnect();
      if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
    };
    io.observe(sentinel);
    const t = setTimeout(() => {
      if (!fired) {
        document.documentElement.classList.add("io-unavailable");
        window.dispatchEvent(new Event("invitation:revealed"));
        const root = document.querySelector("main");
        if (root) {
          root.querySelectorAll<HTMLElement>("*").forEach((n) => {
            const op = n.style.opacity;
            if (op !== "" && parseFloat(op) < 1) n.style.opacity = "1";
            if (n.style.transform && /translate|scale/.test(n.style.transform)) {
              n.style.transform = "none";
            }
          });
        }
        cleanup();
      }
    }, 2500);
    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <main style={{ backgroundColor: "#FFFFFF", width: "100%", overflowX: "hidden" }}>
        <div id="inicio"><Hero /></div>
        <Mensaje />
        <Divider />
        <Ceremonia />
        <Divider />
        <Itinerario />
        <Divider />
        <Vestimenta />
        <AvisoSorpresa />
        <Divider />
        <MesaRegalos />
        <Divider />
        <RSVPClient pases={pases} nombre={nombre} />
        <Footer />
        <VinylButton />
        <FloatingMenu />
      </main>
    </MotionConfig>
  );
}
