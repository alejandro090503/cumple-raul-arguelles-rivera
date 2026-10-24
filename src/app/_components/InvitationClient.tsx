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
import { VenueMap } from "./VenueMap";

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
        variants={{ hidden: { opacity: 0, scaleX: 0.3 }, show: { opacity: 1, scaleX: 1, transition: { duration: 1, ease: EASE } } }}
        className="div-oro"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/divisor-oro.png" alt="" aria-hidden="true" />
      </motion.div>
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
      {/* Polvo dorado que flota sobre el fondo */}
      <div className="h-dust" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 92}%`,
              width: 2 + (i % 4),
              height: 2 + (i % 4),
              animationDelay: `${-((i * 0.9) % 11)}s`,
              animationDuration: `${8 + (i % 5) * 1.7}s`,
            }}
          />
        ))}
      </div>
      <span className="rib rib-a-r" aria-hidden="true" />

      <motion.div
        style={{ y: yContent, opacity, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "clamp(18px, 3.5vw, 30px)" }}
        variants={group(0.18, 0.1)}
        initial="hidden"
        animate={revealed ? "show" : "hidden"}
      >
        {/* Estilo del save the date: monograma, nombre, "Estoy cumpliendo", 50 dorado + Años */}
        <MaskLine as="h1" style={{ margin: 0 }} duration={1}>
          <span className="h50-name">Raúl Argüelles Rivera</span>
        </MaskLine>
        <motion.div variants={fade} className="h50-rule" aria-hidden="true"><i /><b>◆</b><i /></motion.div>
        <motion.p variants={riseSmall} className="h50-eyebrow"><i />Estoy cumpliendo<i /></motion.p>

        <motion.div
          className="h50-wrap"
          variants={{
            hidden: { opacity: 0, scale: 0.6, y: 20 },
            show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 13, mass: 0.8 } },
          }}
        >
          <svg className="h50-flour l" viewBox="0 0 40 160" aria-hidden="true"><path d="M20 4c-10 14 10 22 0 36s10 22 0 36 10 22 0 36 10 22 0 44M20 30c8-2 12-8 10-14M20 66c-8-2-12-8-10-14M20 102c8-2 12-8 10-14M20 138c-8-2-12-8-10-14" /></svg>
          <span className="h50-num" aria-label="50">50</span>
          <span className="h50-anos">Años</span>
          <svg className="h50-flour r" viewBox="0 0 40 160" aria-hidden="true"><path d="M20 4c-10 14 10 22 0 36s10 22 0 36 10 22 0 36 10 22 0 44M20 30c8-2 12-8 10-14M20 66c-8-2-12-8-10-14M20 102c8-2 12-8 10-14M20 138c-8-2-12-8-10-14" /></svg>
        </motion.div>

        <motion.p variants={rise} className="h50-msg">Y me encantaría compartir<br />este momento tan especial contigo.</motion.p>
        <motion.div variants={fade} className="h50-rule" aria-hidden="true"><i /><b>❦</b><i /></motion.div>
        <motion.div variants={rise} className="h50-date">
          <span>Sábado</span><em /><strong>02</strong><em /><span>Enero</span>
        </motion.div>
        <motion.p variants={riseSmall} className="h50-year">2027</motion.p>
        <motion.p variants={riseSmall} className="h50-city">Phoenix, Arizona</motion.p>

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
    <Section className="fx ink-oval halo" bg="transparent" style={{ minHeight: 720, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 28, paddingRight: 28 }}>
      <span className="rib rib-b-l" aria-hidden="true" />
      <InView style={{ maxWidth: 340, margin: "0 auto" }} amount={0.35}>
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

        <motion.div variants={rise}>
          <VenueMap />
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
            No lo olvides
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
            Confirma antes del 15 de diciembre
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 16, color: C.gray, textAlign: "center", lineHeight: 1.6 }}>
            Así podremos apartar tu lugar con todo detalle.
          </p>
        </motion.div>
      </InView>
    </Section>
  );
}

/* ─── Sketch icons ─── */
function IconCoctel() {
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.charcoal} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.charcoal} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.charcoal} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke={C.charcoal} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    { hora: "7:00 – 9:00 p.m.", evento: "CENA", icon: <IconCena /> },
    { hora: "9:00 p.m.", evento: "BAILE", icon: <IconBaile /> },
    { hora: "2:00 a.m.", evento: "FIN DE LA CELEBRACIÓN", icon: <IconCoctel /> },
  ];

  return (
    <Section id="itinerario" className="fx ink-soft halo" bg="transparent">
      <span className="rib rib-full-l" aria-hidden="true" />
      <span className="drape d-br d-light d-small" aria-hidden="true" />
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
              className="it-medal"
            >
              <span className="it-ring" aria-hidden="true" />
              <span className="it-glint" aria-hidden="true" />
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
              <span className="text-shimmer">{item.evento}</span>
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
                className="it-link"
                style={{ width: 2, height: 64, margin: "22px auto", transformOrigin: "top" }}
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
  return (
    <Section id="vestimenta" bg="transparent" className="fx ink-dark halo-dark lj-dc" style={{ paddingTop: 280, paddingBottom: 300 }}>
      <span className="drape d-tl" aria-hidden="true" />
      <span className="drape d-br" aria-hidden="true" />
      <InView style={{ maxWidth: 360, margin: "0 auto" }} amount={0.25}>
        <motion.span variants={riseSmall} className="lj-lbl">Etiqueta</motion.span>
        <MaskLine as="p" style={{ margin: "8px 0 30px" }} duration={1}>
          <span className="lj-title">Código de Vestimenta</span>
        </MaskLine>
        <motion.div variants={rise} className="lj-outfits">
          <div className="lj-outfit">
            <span className="lj-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/look-caballero.png" alt="Ilustración de caballero con traje oscuro" />
            </span>
            <span className="lj-name">Caballero</span>
            <span className="lj-hint">Traje oscuro<br />Formal</span>
          </div>
          <span className="lj-divider" aria-hidden="true" />
          <div className="lj-outfit">
            <span className="lj-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/look-dama.png" alt="Ilustración de dama con vestido largo" />
            </span>
            <span className="lj-name">Dama</span>
            <span className="lj-hint">Vestido largo o midi<br />Formal</span>
          </div>
        </motion.div>
        <motion.p variants={rise} className="lj-type">Formal</motion.p>
        <motion.p variants={riseSmall} className="lj-type-sub">Elegante · Noche</motion.p>
        <motion.p variants={rise} className="lj-msg">¡Ven elegante a celebrar con nosotros esta noche tan especial!</motion.p>
        <motion.div variants={rise} className="lj-avoid">
          <span className="lj-avoid-txt"><b>Color de la noche</b>La vestimenta es únicamente en color negro.</span>
          <span className="lj-sws"><span className="lj-sw" style={{ background: "#000" }} role="img" aria-label="Negro" /></span>
        </motion.div>
      </InView>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════
   ES UNA SORPRESA — más llamativa y viva
   ═══════════════════════════════════════════════════════ */
function Album() {
  const [bloqueado, setBloqueado] = useState(true);
  useEffect(() => {
    // Se desbloquea solo el día del evento (la base además rechaza fotos antes).
    setBloqueado(new Date() < new Date(2027, 0, 2, 0, 0, 0));
  }, []);
  return (
    <Section id="album" className="fx mesh mesh-a halo" bg="transparent">
      <InView style={{ maxWidth: 380, margin: "0 auto" }} amount={0.25}>
        <SectionTitle eyebrow="Comparte tus recuerdos" title="ÁLBUM DE FOTOS" />
        <motion.p variants={rise} className="al-p">Ayúdanos a guardar cada momento: sube aquí las fotos que tomes durante el evento.</motion.p>
        <motion.div variants={scaleIn} className={`al-qr${bloqueado ? " bloqueado" : ""}`}>
          <span className="al-frame">
            <img src="/qr-album.png" alt="Código QR del álbum de fotos" width={220} height={220} />
          </span>
          <a className="al-btn" href="/album" aria-disabled={bloqueado}>Subir mis fotos</a>
        </motion.div>
        {bloqueado && (
          <motion.p variants={rise} className="al-aviso">El álbum de fotos se habilita el día del evento. Regresa aquí y sube todas tus fotos de la noche ✨</motion.p>
        )}
      </InView>
    </Section>
  );
}

function AvisoSorpresa() {
  return (
    <Section id="detalles" bg="transparent" className="fx ink-dark halo-dark nm" style={{ position: "relative", overflow: "hidden", paddingTop: 290, paddingBottom: 310 }}>
      <span className="drape d-tr2" aria-hidden="true" />
      <span className="drape d-bl" aria-hidden="true" />
      <InView style={{ maxWidth: 380, margin: "0 auto", position: "relative", zIndex: 1 }} amount={0.12} variants={group(0.1)}>
        <motion.p variants={riseSmall} className="nm-k">Una noche especial,</motion.p>
        <MaskLine as="h2" style={{ margin: "2px 0 10px" }} duration={1}><span className="nm-script">Personas Especiales</span></MaskLine>
        <motion.div variants={fade} className="div-oro"><img src="/divisor-oro.png" alt="" aria-hidden="true" /></motion.div>
        <motion.p variants={rise} className="nm-name">Raúl Argüelles</motion.p>
        <motion.p variants={riseSmall} className="nm-sub">Celebración de mis 50 años</motion.p>
        <motion.p variants={rise} className="nm-p">Cumplir 50 años es celebrar la vida, los momentos compartidos y, sobre todo, a las personas que forman parte de nuestra historia.</motion.p>
        <motion.p variants={rise} className="nm-p">Si recibes esta invitación, es porque he elegido compartir contigo una noche importante y especial para mí. Tu presencia es bienvenida y será apreciada de corazón.</motion.p>
        <motion.p variants={rise} className="nm-p nm-lead">Para que esta celebración sea tan especial como la he imaginado, te agradeceré tomar en cuenta los siguientes detalles:</motion.p>
        <div className="nm-list">
          <motion.div variants={rise} className="nm-item">
            <span className="nm-ico" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 6l8 6 8-6 6 4v30H10V10zM24 12v28M20 8l4 8 4-8M21 14l3 2 3-2" /></svg></span>
            <div><p className="nm-it">Código de vestimenta</p><p className="nm-ix">Elegancia formal. La temática de la noche será azul marino, dorado y negro; te invitamos a vestir únicamente de negro para mantener la armonía de nuestra celebración.</p></div>
          </motion.div>
          <motion.div variants={rise} className="nm-item">
            <span className="nm-ico" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="17" cy="15" r="6" /><circle cx="32" cy="15" r="6" /><path d="M6 40c0-7 5-12 11-12s11 5 11 12M23 40c0-7 4-12 9-12s10 5 10 12" /></svg></span>
            <div><p className="nm-it">Celebración exclusiva para adultos</p><p className="nm-ix">Esta ocasión ha sido organizada únicamente para adultos y no habrá excepciones. Agradezco de antemano tu comprensión.</p></div>
          </motion.div>
          <motion.div variants={rise} className="nm-item">
            <span className="nm-ico" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="24" cy="18" rx="13" ry="4" /><path d="M24 22v16M18 38h12M7 16v22M7 28h7v10M41 16v22M41 28h-7v10" /></svg></span>
            <div><p className="nm-it">Mesas y lugares asignados</p><p className="nm-ix">La distribución de las mesas se ha organizado previamente para el buen desarrollo del evento. Agradecemos respetar los lugares asignados, ya que cada detalle ha sido planeado con anticipación.</p></div>
          </motion.div>
          <motion.div variants={rise} className="nm-item">
            <span className="nm-ico" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="13" width="34" height="24" rx="2" /><path d="M7 15l17 12 17-12M17 10h14v8" /></svg></span>
            <div><p className="nm-it">Invitación y confirmación</p><p className="nm-ix">Cada invitación ha sido considerada de manera personal. Te pedimos confirmar tu asistencia y respetar el número de personas indicado en ella.</p></div>
          </motion.div>
        </div>
        <motion.p variants={rise} className="nm-p">Mi deseo es compartir una noche de alegría, buena compañía, respeto y recuerdos inolvidables. No se trata de una fiesta perfecta, sino de una noche especial entre personas que han sido invitadas con cariño.</motion.p>
        <motion.p variants={rise} className="nm-p">Gracias por acompañarme en este capítulo tan significativo de mi vida. Espero que disfrutemos juntos una velada llena de elegancia, alegría y buenos momentos.</motion.p>
        <motion.p variants={riseSmall} className="nm-with">Con aprecio,</motion.p>
        <motion.p variants={rise} className="nm-sign">Raúl Argüelles</motion.p>
        <motion.p variants={riseSmall} className="nm-sub">50 años de vida, historias y nuevos comienzos.</motion.p>
        <motion.div variants={fade} className="div-oro"><img src="/divisor-oro.png" alt="" aria-hidden="true" /></motion.div>
        <motion.p variants={rise} className="nm-quote">“La invitación es un gesto de cariño; el respeto y la buena disposición son el mejor regalo para compartir esta noche.”</motion.p>
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
    <Section id="regalos" className="fx ink-soft ink-soft-b halo env-rain-host" bg="transparent">
      <span className="rib rib-a-r rib-low" aria-hidden="true" />
      <InView amount={0.25}>
        <SectionTitle eyebrow="Sugerencia de regalo" title="LLUVIA DE SOBRES" />
        <motion.p variants={rise} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 18, color: C.gray, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 32px" }}>
          Tu presencia es el mejor regalo. Si deseas tener un detalle, habrá un buzón para sobres en la recepción.
        </motion.p>
        
        {/* Sobres que llueven detrás */}
        <div className="env-rain" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-(i * 1.3) % 9}s`, animationDuration: `${7 + (i % 4) * 1.6}s`, transform: `scale(${0.6 + (i % 3) * 0.25})` }}>
              <svg viewBox="0 0 40 28" width="34" height="24"><rect x="1" y="1" width="38" height="26" rx="3" fill="#FFFDF6" stroke="#C9A227" strokeWidth="1.2" /><path d="M1 3l19 13L39 3" fill="none" stroke="#C9A227" strokeWidth="1.2" /></svg>
            </span>
          ))}
        </div>
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
        <motion.p variants={rise} className="gr-or">También puedes elegir un detalle en</motion.p>
        <motion.div variants={rise} className="gr-stores">
          <a className="gr-store" href="https://www.dillards.com/registry" target="_blank" rel="noopener noreferrer">
            <span className="gr-name">Dillard&apos;s</span><span className="gr-cta">Ver mesa de regalos</span>
          </a>
          <a className="gr-store" href="https://www.macys.com/registry/wedding/registrysearch" target="_blank" rel="noopener noreferrer">
            <span className="gr-name">Macy&apos;s</span><span className="gr-cta">Ver mesa de regalos</span>
          </a>
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
      <span className="drape d-tr d-small" aria-hidden="true" />

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
        <MesaRegalos />
        <Divider />
        <RSVPClient pases={pases} nombre={nombre} />
        <Album />
        <AvisoSorpresa />
        <Footer />
        <VinylButton />
        <FloatingMenu />
      </main>
    </MotionConfig>
  );
}
