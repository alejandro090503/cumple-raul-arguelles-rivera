"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const rRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};
const rTicket: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 28 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};
const rGroup: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const PANEL_API = "https://panel-invitados.vercel.app/api/confirmar";
const RSVP_URL = "https://cumple-raul-arguelles-rivera.vercel.app";
const DEADLINE = new Date(2026, 11, 15, 23, 59, 59);

const C = {
  black: "#14275E",
  gold: "#A8841F",
  goldLight: "#D4AF37",
  gray: "#3E4A6B",
  softGray: "#5B6684",
  charcoal: "#1E3A8A",
  border: "#C9D0E0",
  cream: "#FFFFFF",
  white: "#FFFFFF",
} as const;

/* ─── Ticket ─── */
function PaseTicket({ pases, nombre }: { pases: number; nombre: string }) {
  return (
    <div className="relative mx-auto" style={{ width: "min(300px, 88vw)" }}>
      <div
        className="absolute -inset-6 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)", filter: "blur(20px)" }}
        aria-hidden="true"
      />
      <div className="relative" style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(20,39,94,0.08)", overflow: "hidden" }}>
        <div style={{ backgroundColor: C.gold, height: 4 }} />
        <div style={{ padding: "40px 32px 32px", textAlign: "center" }}>
          <div style={{ position: "absolute", top: 18, left: 14, width: 16, height: 16, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}`, opacity: 0.6 }} aria-hidden="true" />
          <div style={{ position: "absolute", top: 18, right: 14, width: 16, height: 16, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, opacity: 0.6 }} aria-hidden="true" />

          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, textAlign: "center", marginBottom: 16 }}>
            50 Años · Raúl Argüelles Rivera
          </p>

          {nombre ? (
            <>
              <p style={{ fontFamily: "var(--font-heading)", color: C.black, fontSize: "clamp(1.4rem, 6.5vw, 2rem)", lineHeight: 1.25, fontWeight: 700, textAlign: "center", width: "100%", overflowWrap: "break-word" }}>
                {nombre}
              </p>
              <div style={{ height: 1, width: 40, backgroundColor: C.gold, opacity: 0.5, margin: "22px auto" }} aria-hidden="true" />
            </>
          ) : (
            <div style={{ height: 1, width: 40, backgroundColor: C.gold, opacity: 0.5, margin: "4px auto 22px" }} aria-hidden="true" />
          )}

          <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontWeight: 400, fontSize: 17, color: C.softGray, letterSpacing: "0.04em", marginBottom: 6 }}>
            admite
          </p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 72, color: C.black, lineHeight: 1, letterSpacing: "0.02em" }}>
            {pases}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, letterSpacing: "0.24em", textTransform: "uppercase", color: C.charcoal, textAlign: "center", marginTop: 8, marginBottom: 28 }}>
            {pases === 1 ? "Persona" : "Personas"}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, marginLeft: -32, marginRight: -32 }} aria-hidden="true">
            <div style={{ height: 1, flex: 1, borderTop: `1px dashed ${C.border}` }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: C.cream, border: `1px solid ${C.border}` }} />
            <div style={{ height: 1, flex: 1, borderTop: `1px dashed ${C.border}` }} />
          </div>

          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: C.charcoal, textAlign: "center", marginBottom: 4 }}>
            02 · Enero · 2027
          </p>
          <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontWeight: 600, fontSize: 17, color: C.gray, textAlign: "center", marginBottom: 20 }}>
            Phoenix, Arizona
          </p>
        </div>
        <div style={{ backgroundColor: C.gold, height: 4 }} />
      </div>
    </div>
  );
}

export function RSVPClient({ pases, nombre }: { pases: number; nombre: string }) {
  const frozen = typeof window !== "undefined" && Date.now() > DEADLINE.getTime();
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [nombres, setNombres] = useState<string[]>(Array(pases).fill(""));
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState<string>(C.gold);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState(frozen ? "Fecha límite alcanzada" : "Confirmar asistencia");

  useEffect(() => {
    if (!nombre || frozen) return;
    fetch(`${PANEL_API}?nombre=${encodeURIComponent(nombre)}&url_boda=${encodeURIComponent(RSVP_URL)}`)
      .then((r) => r.json())
      .then((resp) => {
        const d = resp.invitado;
        if (d && (d.estado === "confirmado" || d.estado === "declino")) {
          const c = d.estado === "confirmado" ? "yes" : "no";
          if (d.nombres_confirmados?.length) {
            setNombres(Array(pases).fill("").map((_, i) => d.nombres_confirmados[i] || ""));
          }
          setChoice(c);
          setBtnLabel("Actualizar respuesta");
          setFeedback(
            c === "yes"
              ? "¡Ya tienes confirmada tu asistencia! Puedes actualizar tu respuesta."
              : "Ya tienes registrado que no podrás asistir. Puedes cambiar tu respuesta."
          );
        }
      })
      .catch(() => {});
  }, [nombre, frozen, pases]);

  function handleSelect(c: "yes" | "no") {
    setChoice(c);
    setFeedback("");
  }

  async function handleConfirm() {
    if (frozen || loading) return;
    if (!choice) {
      setFeedbackColor("#C0392B");
      setFeedback("Por favor selecciona si asistirás o no.");
      return;
    }
    const nombresFilled = choice === "yes" ? nombres.filter((n) => n.trim()) : [];
    if (choice === "yes" && nombresFilled.length === 0) {
      setFeedbackColor("#C0392B");
      setFeedback("Por favor escribe al menos un nombre.");
      return;
    }
    setLoading(true);
    setBtnLabel("Enviando…");
    setFeedback("");
    try {
      const r = await fetch(PANEL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre || nombresFilled[0] || "Invitado",
          url_boda: RSVP_URL,
          estado: choice === "yes" ? "confirmado" : "declino",
          pases,
          pases_confirmados: choice === "yes" ? nombresFilled.length : 0,
          nombres_confirmados: choice === "yes" ? nombresFilled : [],
        }),
      });
      const d = await r.json().catch(() => null);
      if (r.status === 403 && d?.error === "rsvp_cerrado") {
        setFeedbackColor(C.softGray);
        setFeedback("La fecha para confirmar asistencia ha pasado.");
        setBtnLabel("Fecha límite alcanzada");
        return;
      }
      if (!r.ok || !d?.ok) throw new Error("fail");
      setBtnLabel("Actualizar respuesta");
      setFeedbackColor(choice === "yes" ? C.gold : C.softGray);
      setFeedback(
        choice === "yes"
          ? "¡Tu asistencia ha sido confirmada! Será un honor contar contigo."
          : "Registramos que no podrás asistir. ¡Gracias por avisarnos!"
      );
      if (choice === "yes") window.dispatchEvent(new Event("rsvp:confirmed"));
    } catch {
      setBtnLabel("Confirmar asistencia");
      setFeedbackColor("#B42318");
      setFeedback("No pudimos guardar tu respuesta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const btnBase: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    minHeight: 52,
    cursor: frozen ? "not-allowed" : "pointer",
    border: "none",
    padding: "16px 40px",
    transition: "opacity .25s",
    opacity: frozen ? 0.45 : 1,
  };

  return (
    <section id="rsvp" className="pt-36 pb-36 md:pt-52 md:pb-52 px-6 text-center fx mesh mesh-c halo" style={{ backgroundColor: "transparent" }}>
      <span className="rib rib-edge-r" aria-hidden="true" />
      <span className="rib rib-edge-r rib-edge-r2" aria-hidden="true" />
      <span className="drape d-bl2 d-light d-small" aria-hidden="true" />
      <motion.div
        className="max-w-md mx-auto flex flex-col items-center"
        variants={rGroup}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Eyebrow */}
        <motion.p variants={rRise} style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.26em", textTransform: "uppercase", color: C.gold, textAlign: "center", marginBottom: 16 }}>
          Confirmar asistencia
        </motion.p>

        <motion.h2 variants={rRise} style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(2.5rem, 10vw, 4rem)", letterSpacing: "0.12em", color: C.black, lineHeight: 1, marginBottom: 20 }}>
          RSVP
        </motion.h2>

        {/* Ornament */}
        <motion.div variants={rRise} className="flex items-center gap-3 mb-10">
          <div style={{ height: 1, width: 36, backgroundColor: C.gold, opacity: 0.4 }} />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill={C.gold} opacity="0.55" />
          </svg>
          <div style={{ height: 1, width: 36, backgroundColor: C.gold, opacity: 0.4 }} />
        </motion.div>

        <motion.p variants={rRise} style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontStyle: "italic", fontSize: "clamp(1.15rem, 4.6vw, 1.35rem)", color: C.charcoal, lineHeight: 1.75, marginBottom: 48, maxWidth: 320, textAlign: "center" }}>
          Confirma tu asistencia antes del 15 de diciembre de 2026 para apartar tu lugar.
        </motion.p>

        {/* Ticket with nombre */}
        <motion.div variants={rTicket} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <PaseTicket pases={pases} nombre={nombre} />
        </motion.div>

        <div style={{ height: 40 }} />

        {/* Toggle */}
        {!frozen && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            <button
              onClick={() => handleSelect("yes")}
              style={{
                ...btnBase,
                backgroundColor: choice === "yes" ? C.black : "transparent",
                color: choice === "yes" ? C.white : C.charcoal,
                border: `1px solid ${choice === "yes" ? C.black : C.border}`,
              }}
            >
              Asistiré
            </button>
            <button
              onClick={() => handleSelect("no")}
              style={{
                ...btnBase,
                backgroundColor: choice === "no" ? C.charcoal : "transparent",
                color: choice === "no" ? C.white : C.charcoal,
                border: `1px solid ${choice === "no" ? C.charcoal : C.border}`,
              }}
            >
              No podré asistir
            </button>
          </div>
        )}

        {/* Name fields */}
        {choice === "yes" && (
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, textAlign: "left" }}>
            {nombres.map((n, i) => (
              <div key={i}>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: C.softGray, marginBottom: 6 }}>
                  {`Nombre completo de invitado ${i + 1}`}
                </p>
                <input
                  type="text"
                  value={n}
                  placeholder={`Nombre completo de invitado ${i + 1}`}
                  autoComplete="off"
                  onChange={(e) => {
                    const copy = [...nombres];
                    copy[i] = e.target.value;
                    setNombres(copy);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1px solid ${C.border}`,
                    backgroundColor: C.white,
                    fontFamily: "var(--font-body)",
                    fontSize: 17,
                    color: C.black,
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Confirm button */}
        <button
          className="rsvp-breathe"
          onClick={handleConfirm}
          disabled={loading || frozen}
          style={{
            ...btnBase,
            backgroundColor: C.black,
            color: C.white,
            paddingLeft: `calc(40px + .28em)`,
          }}
        >
          {btnLabel}
        </button>

        {/* Feedback */}
        {feedback && (
          <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 16, color: feedbackColor, marginTop: 20, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
            {feedback}
          </p>
        )}
      </motion.div>
    </section>
  );
}
