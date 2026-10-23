"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "ceremonia", label: "Celebración" },
  { id: "itinerario", label: "Itinerario" },
  { id: "vestimenta", label: "Vestimenta" },
  { id: "regalos", label: "Regalos" },
  { id: "rsvp", label: "Confirmar" },
];

const NAVY = "#0B1A3D";
const GOLD = "#D4AF37";
const FOIL = "linear-gradient(115deg,#9C7A1E 0%,#D4AF37 30%,#FBEFB8 50%,#D4AF37 70%,#8E6C17 100%)";

export function FloatingMenu() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("inicio");
  const [desktop, setDesktop] = useState(false);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [ind, setInd] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const on = () => setTimeout(() => setShown(true), 700);
    window.addEventListener("invitation:revealed", on);
    const t = setTimeout(() => setShown(true), 8000);
    const mq = window.matchMedia("(min-width: 1024px)");
    const upd = () => setDesktop(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => {
      window.removeEventListener("invitation:revealed", on);
      clearTimeout(t);
      mq.removeEventListener("change", upd);
    };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const a = linkRefs.current[current];
    if (a) setInd({ x: a.offsetLeft, w: a.offsetWidth });
  }, [current, desktop, shown]);

  /* confeti al confirmar */
  useEffect(() => {
    const burst = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cols = ["#D4AF37", "#F1DC8C", "#1E3A8A", "#FFFFFF", "#9C7A1E"];
      for (let i = 0; i < 40; i++) {
        const c = document.createElement("div");
        c.className = "cf-piece";
        c.style.left = Math.random() * 100 + "vw";
        c.style.background = cols[i % cols.length];
        c.style.setProperty("--x", (Math.random() - 0.5) * 160 + "px");
        c.style.setProperty("--d", 2.2 + Math.random() * 1.6 + "s");
        c.style.animationDelay = Math.random() * 0.4 + "s";
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4500);
      }
    };
    window.addEventListener("rsvp:confirmed", burst);
    return () => window.removeEventListener("rsvp:confirmed", burst);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), open ? 250 : 0);
  };


  const btn: React.CSSProperties = {
    minWidth: 44, minHeight: 44, borderRadius: 999, border: `1px solid ${GOLD}88`, background: "transparent",
    color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  };

  return (
    <>
      <nav
        aria-label="Secciones"
        style={{
          position: "fixed", left: "50%", zIndex: 9500,
          ...(desktop ? { top: 20 } : { bottom: "max(1rem, env(safe-area-inset-bottom))" }),
          transform: `translate(-50%, ${shown ? 0 : desktop ? -40 : 40}px)`,
          opacity: shown ? 1 : 0, pointerEvents: shown ? "auto" : "none",
          transition: "opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1)",
          display: "flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 14px", borderRadius: 999,
          background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(212,175,55,0.45)", boxShadow: "0 18px 50px rgba(11,26,61,0.22)",
        }}
      >
        <button onClick={() => go("inicio")} aria-label="Ir al inicio" style={{ ...btn, border: "none", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "#14275E", letterSpacing: "0.08em" }}>
          RA
        </button>
        {desktop && (
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", top: 0, left: 0, height: "100%", width: ind.w, transform: `translateX(${ind.x}px)`, borderRadius: 999, background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.55)", transition: "transform .45s cubic-bezier(.2,.8,.2,1), width .45s cubic-bezier(.2,.8,.2,1)" }} />
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                ref={(el) => { linkRefs.current[s.id] = el; }}
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); go(s.id); }}
                style={{ position: "relative", zIndex: 1, padding: "12px 14px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#14275E", textDecoration: "none" }}
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
        {!desktop && (
          <button
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Abrir menú"
            style={{ ...btn, border: "none", background: FOIL, color: NAVY, width: 48, height: 48, padding: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        )}
      </nav>

      <div
        aria-hidden={!open}
        style={{
          position: "fixed", inset: 0, zIndex: 9600, background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          clipPath: open ? "circle(150% at 85% 95%)" : "circle(0% at 85% 95%)",
          transition: "clip-path .6s cubic-bezier(.2,.8,.2,1)", pointerEvents: open ? "auto" : "none",
          display: "flex", flexDirection: "column", padding: "22px 26px max(22px, env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: "#14275E", letterSpacing: "0.08em" }}>RA</span>
          <button onClick={() => setOpen(false)} aria-label="Cerrar" style={{ width: 48, height: 48, borderRadius: "50%", border: `1px solid ${GOLD}`, background: "transparent", color: "#14275E", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <ul style={{ listStyle: "none", margin: "auto 0", padding: 0 }}>
          {SECTIONS.map((s, i) => (
            <li
              key={s.id}
              style={{
                opacity: open ? 1 : 0, transform: open ? "none" : "translateY(18px)",
                transition: `opacity .45s ease ${open ? 150 + i * 70 : 0}ms, transform .45s ease ${open ? 150 + i * 70 : 0}ms`,
              }}
            >
              <a
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); go(s.id); }}
                style={{
                  display: "flex", alignItems: "baseline", gap: 16, minHeight: 44, padding: "6px 0", textDecoration: "none",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(2rem, 9vw, 3rem)", lineHeight: 1.15,
                  color: current === s.id ? "#A8841F" : "#14275E", fontStyle: current === s.id ? "italic" : "normal",
                }}
              >
                <small style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "#A8841F", letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </small>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "#3E4A6B" }}>
          2 · Enero · 2027 · Phoenix, Arizona
        </p>
      </div>
    </>
  );
}
