"use client";

import { useState, useEffect, useRef } from "react";
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

/* Panel Celestial (QR) */
const PANEL_API = "https://panel-invitados-qr.vercel.app/api/confirmar";
const RSVP_URL = "https://cumple-raul-arguelles-rivera.vercel.app";
/* Respaldo solo si el panel no responde: 15 dic 2026 fin del día, hora de Phoenix */
const RESPALDO = Date.parse("2026-12-15T23:59:59-07:00");
const QR_LIB = "https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js";

/* Sin acentos ni mayúsculas para emparejar las respuestas guardadas */
const clave = (x: string) => String(x || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

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

/* ─── Códigos de acceso (carrusel, un pase a la vez) ─── */
type Qr = { nombre_persona: string; codigo: string; mesa: string | null };

declare global {
  interface Window {
    QRCode?: { toDataURL: (t: string, o: object, cb: (e: unknown, url: string) => void) => void };
  }
}

function cargarQrLib(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.QRCode) return resolve();
    let sc = document.getElementById("qrcode-lib") as HTMLScriptElement | null;
    if (!sc) {
      sc = document.createElement("script");
      sc.id = "qrcode-lib";
      sc.src = QR_LIB;
      document.head.appendChild(sc);
    }
    sc.addEventListener("load", () => (window.QRCode ? resolve() : reject()));
    sc.addEventListener("error", () => reject());
  });
}

function CodigosAcceso({ qrs, pendientes }: { qrs: Qr[]; pendientes: boolean }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrs.length) return;
    let vivo = true;
    cargarQrLib()
      .then(() => {
        qrs.forEach((q) => {
          window.QRCode!.toDataURL(q.codigo, { width: 480, margin: 2, errorCorrectionLevel: "M", color: { dark: "#14275E", light: "#FFFFFF" } }, (err, url) => {
            if (!err && vivo) setUrls((u) => ({ ...u, [q.codigo]: url }));
          });
        });
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, [qrs]);

  function irA(i: number) {
    const t = trackRef.current;
    const card = t?.children[i] as HTMLElement | undefined;
    if (t && card) t.scrollTo({ left: card.offsetLeft - (t.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  }
  function onScroll() {
    const t = trackRef.current;
    if (!t) return;
    const centro = t.scrollLeft + t.clientWidth / 2;
    let mejor = 0, dist = Infinity;
    Array.from(t.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - centro);
      if (d < dist) { dist = d; mejor = i; }
    });
    setIdx(mejor);
  }

  const titulo = (
    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 26, color: C.black, marginBottom: 6 }}>Tus códigos de acceso</p>
  );
  if (!qrs.length) {
    if (!pendientes) return null;
    return (
      <div style={{ marginTop: 32, maxWidth: 320, textAlign: "center" }}>
        {titulo}
        <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 17, color: C.softGray, lineHeight: 1.6 }}>
          Tus códigos de acceso aparecerán aquí cuando se acerque el evento. Vuelve a abrir tu invitación unos días antes.
        </p>
      </div>
    );
  }
  const varios = qrs.length > 1;
  return (
    <div style={{ marginTop: 32, width: "100%", maxWidth: 340, textAlign: "center" }}>
      {titulo}
      <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 17, color: C.softGray, lineHeight: 1.6, marginBottom: 14 }}>
        {varios ? "Presenta un código por persona en la entrada." : "Presenta este código en la entrada."}
      </p>
      <div style={{ position: "relative" }}>
        {varios && (
          <>
            <button type="button" aria-label="Código anterior" onClick={() => irA(Math.max(0, idx - 1))} disabled={idx === 0} style={{ ...navBtn, left: -6, opacity: idx === 0 ? 0 : 1 }}>‹</button>
            <button type="button" aria-label="Código siguiente" onClick={() => irA(Math.min(qrs.length - 1, idx + 1))} disabled={idx === qrs.length - 1} style={{ ...navBtn, right: -6, opacity: idx === qrs.length - 1 ? 0 : 1 }}>›</button>
          </>
        )}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="rsvp-qr-track"
          style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", padding: varios ? "6px 11% 12px" : "6px 8% 12px", scrollbarWidth: "none" }}
        >
          {qrs.map((q, i) => (
            <div
              key={q.codigo}
              onClick={() => i !== idx && irA(i)}
              style={{
                flex: varios ? "0 0 78%" : "0 0 84%", scrollSnapAlign: "center", backgroundColor: C.white, border: `1px solid ${C.border}`,
                boxShadow: "0 10px 30px rgba(20,39,94,0.08)", padding: "18px 12px 16px", transition: "transform .35s ease, opacity .35s ease",
                transform: varios && i !== idx ? "scale(.92)" : "none", opacity: varios && i !== idx ? 0.55 : 1,
              }}
            >
              <div style={{ backgroundColor: C.gold, height: 3, margin: "-18px -12px 14px" }} />
              {urls[q.codigo]
                ? // eslint-disable-next-line @next/next/no-img-element -- data URL del QR generado en el navegador
                  <img src={urls[q.codigo]} alt={`Código QR de ${q.nombre_persona}`} width={150} height={150} style={{ display: "block", margin: "0 auto" }} />
                : <div style={{ width: 150, height: 150, margin: "0 auto", backgroundColor: "#F3F5FA" }} />}
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 21, color: C.black, marginTop: 10, lineHeight: 1.25 }}>{q.nombre_persona}</p>
              {q.mesa && <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginTop: 3 }}>Mesa {q.mesa}</p>}
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.softGray, marginTop: 10 }}>Código de respaldo</p>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: 15, letterSpacing: "0.12em", color: C.black, marginTop: 3, userSelect: "all" }}>{q.codigo}</p>
              {urls[q.codigo] && (
                <a href={urls[q.codigo]} download={`Pase 50 Raul - ${q.nombre_persona}.png`} onClick={(e) => e.stopPropagation()}
                  style={{ display: "inline-block", marginTop: 12, padding: "8px 20px", border: `1px solid ${C.border}`, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.charcoal, textDecoration: "none" }}>
                  Descargar
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      {varios && (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>
            {qrs.map((q, i) => (
              <button key={q.codigo} type="button" aria-label={`Ver código ${i + 1}`} onClick={() => irA(i)}
                style={{ width: i === idx ? 20 : 7, height: 7, padding: 0, border: 0, borderRadius: 4, backgroundColor: i === idx ? C.gold : C.border, transition: "width .3s, background-color .3s", cursor: "pointer" }} />
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.softGray, marginTop: 10 }}>
            Pase {idx + 1} de {qrs.length}
          </p>
        </>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  position: "absolute", top: "42%", transform: "translateY(-50%)", zIndex: 2, width: 34, height: 34, borderRadius: "50%",
  border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.black, fontSize: 22, lineHeight: 1, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(20,39,94,0.10)", transition: "opacity .25s",
};

/* ─── RSVP ───
   Lee del panel Celestial (QR) el modo de confirmación:
   - "nombres": la familia escribió los nombres; cada persona marca Asistirá / No asistirá.
   - "pases":   el invitado escribe un nombre por pase.
   Cambiar de modo es solo cambiar bodas.modo_confirmacion en el panel. */
type Gracias = { estado: "confirmado" | "declino"; nombres: string[] };

export function RSVPClient({ pases, nombre }: { pases: number; nombre: string }) {
  const [cargado, setCargado] = useState(false);
  const [modo, setModo] = useState<"nombres" | "pases">("nombres");
  const [asignados, setAsignados] = useState<string[]>([]);
  const [eleccion, setEleccion] = useState<Record<number, "yes" | "no">>({});
  const [pasesPanel, setPasesPanel] = useState(pases);
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [nombres, setNombres] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [vencida, setVencida] = useState(false);
  const [cerradoSrv, setCerradoSrv] = useState(false);
  const [anulada, setAnulada] = useState(false);
  const [respondido, setRespondido] = useState(false);
  const [gracias, setGracias] = useState<Gracias | null>(null);
  const [editando, setEditando] = useState(false);
  const [qrs, setQrs] = useState<Qr[]>([]);
  const [qrsPend, setQrsPend] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState<string>(C.gold);
  const [loading, setLoading] = useState(false);

  /* La fecha límite la manda el panel (se amplía desde ahí); el respaldo solo si no responde */
  const frozen = cerradoSrv || vencida;
  const bloqueado = !cargado || frozen || anulada;

  useEffect(() => {
    const fijar = (boda: { fecha_limite_rsvp?: string | null } | null | undefined) => {
      const t = !boda ? RESPALDO : boda.fecha_limite_rsvp ? Date.parse(boda.fecha_limite_rsvp) : NaN;
      setVencida(!isNaN(t) && Date.now() > t);
    };
    if (!nombre) {
      fetch(`${PANEL_API}?solo_boda=1&url_boda=${encodeURIComponent(RSVP_URL)}`)
        .then((r) => r.json()).then((resp) => fijar(resp?.boda)).catch(() => fijar(null));
      return;
    }
    fetch(`${PANEL_API}?nombre=${encodeURIComponent(nombre)}&url_boda=${encodeURIComponent(RSVP_URL)}`)
      .then((r) => r.json())
      .then((resp) => {
        const boda = resp?.boda;
        fijar(boda);
        const d = resp?.invitado;
        if (!d) {
          setAnulada(true);
          setFeedbackColor("#B42318");
          setFeedback("Esta invitación ya no está disponible. Contacta al anfitrión.");
          return;
        }
        const m: "nombres" | "pases" = boda?.modo_confirmacion === "pases" ? "pases" : "nombres";
        const lista: string[] = (Array.isArray(d.nombres_asignados) ? d.nombres_asignados : []).filter((n: string) => n && n.trim());
        if (m === "nombres" && !lista.length) {
          setAnulada(true);
          setFeedbackColor("#B42318");
          setFeedback("Tu invitación aún no tiene nombres asignados. Contacta al anfitrión.");
          return;
        }
        const total = typeof d.pases === "number" && d.pases > 0 && d.pases <= 20 ? d.pases : pases;
        setModo(m);
        setAsignados(lista);
        setPasesPanel(total);
        if (d.mensaje) setMensaje(d.mensaje);
        const conf: string[] = d.nombres_confirmados || [];
        if (d.estado === "confirmado" || d.estado === "declino") {
          if (m === "nombres") {
            const set = new Set(conf.map(clave));
            const e: Record<number, "yes" | "no"> = {};
            lista.forEach((n, i) => { e[i] = d.estado === "declino" ? "no" : set.has(clave(n)) ? "yes" : "no"; });
            setEleccion(e);
          } else {
            setChoice(d.estado === "confirmado" ? "yes" : "no");
          }
          setRespondido(true);
          setGracias({ estado: d.estado, nombres: conf });
          const q: Qr[] = resp.qrs || [];
          setQrs(q);
          setQrsPend(d.estado === "confirmado" && !q.length && !boda?.qrs_generados_en);
        }
        setNombres(Array(total).fill("").map((_, i) => conf[i] || ""));
      })
      .catch(() => {
        fijar(null);
        setFeedbackColor("#B42318");
        setFeedback("No pudimos cargar tu invitación. Recarga la página.");
      })
      .finally(() => setCargado(true));
  }, [nombre, pases]);

  async function handleConfirm() {
    if (bloqueado || loading || !nombre) return;
    let estado: "confirmado" | "declino";
    let lista: string[];
    if (modo === "nombres") {
      const faltan = asignados.filter((_, i) => !eleccion[i]).length;
      if (faltan) {
        setFeedbackColor("#B42318");
        setFeedback(`Por favor responde por cada persona (${faltan} pendiente${faltan === 1 ? "" : "s"}).`);
        return;
      }
      lista = asignados.filter((_, i) => eleccion[i] === "yes");
      estado = lista.length ? "confirmado" : "declino";
    } else {
      if (!choice) {
        setFeedbackColor("#B42318");
        setFeedback("Por favor selecciona si asistirás o no.");
        return;
      }
      lista = choice === "yes" ? nombres.map((n) => n.trim()).filter(Boolean) : [];
      if (choice === "yes" && !lista.length) {
        setFeedbackColor("#B42318");
        setFeedback("Por favor escribe al menos un nombre.");
        return;
      }
      estado = choice === "yes" ? "confirmado" : "declino";
    }
    setLoading(true);
    setFeedback("");
    try {
      const r = await fetch(PANEL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          url_boda: RSVP_URL,
          estado,
          pases_confirmados: lista.length,
          nombres_confirmados: lista,
          mensaje,
        }),
      });
      const d = await r.json().catch(() => null);
      if (r.status === 403 && d?.error === "rsvp_cerrado") { setCerradoSrv(true); return; }
      if (r.status === 404 && d?.error === "invitacion_no_disponible") {
        setAnulada(true);
        setFeedbackColor("#B42318");
        setFeedback("Esta invitación ya no está disponible. Contacta al anfitrión.");
        return;
      }
      if (!r.ok || !d?.ok) throw new Error("fail");
      setRespondido(true);
      setGracias({ estado, nombres: lista });
      setEditando(false);
      setQrs(d.qrs || []);
      setQrsPend(!!d.qrs_pendientes);
      if (estado === "confirmado") window.dispatchEvent(new Event("rsvp:confirmed"));
    } catch {
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
    cursor: bloqueado ? "not-allowed" : "pointer",
    border: "none",
    padding: "16px 40px",
    transition: "opacity .25s",
    opacity: bloqueado ? 0.45 : 1,
  };
  const toggleBtn = (on: boolean, dark: string): React.CSSProperties => ({
    ...btnBase,
    flex: 1,
    padding: "14px 10px",
    fontSize: 13,
    letterSpacing: "0.12em",
    backgroundColor: on ? dark : "transparent",
    color: on ? C.white : C.charcoal,
    border: `1px solid ${on ? dark : C.border}`,
  });

  const mostrarGracias = !!gracias && !editando;
  const ticketPases = modo === "nombres" && asignados.length ? asignados.length : pasesPanel;
  const btnLabel = frozen ? "Fecha límite alcanzada" : loading ? "Enviando…" : respondido ? "Actualizar respuesta" : "Confirmar asistencia";

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
          <PaseTicket pases={ticketPases} nombre={nombre} />
        </motion.div>

        <div style={{ height: 40 }} />

        {mostrarGracias ? (
          /* Agradecimiento: la bandeja se cierra al confirmar y se puede reabrir */
          <div style={{ width: "100%", maxWidth: 340, backgroundColor: C.white, border: `1px solid ${C.border}`, padding: "28px 22px", boxShadow: "0 12px 40px rgba(20,39,94,0.06)" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px", display: "block" }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="8.5 12.5 11 15 16 9.5" />
            </svg>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: C.black, marginBottom: 8 }}>
              {gracias!.estado === "confirmado" ? "¡Gracias por confirmar!" : "Gracias por avisarnos"}
            </p>
            <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 17, color: C.softGray, lineHeight: 1.6, marginBottom: 18 }}>
              {gracias!.estado === "confirmado"
                ? gracias!.nombres.length === 1
                  ? `Te esperamos, ${gracias!.nombres[0]}.`
                  : `Confirmamos ${gracias!.nombres.length} lugares: ${gracias!.nombres.join(", ")}.`
                : "Lamento que no puedan acompañarme. Los voy a extrañar."}
            </p>
            {!anulada && (
              <button type="button" onClick={() => { if (!frozen) { setEditando(true); setFeedback(""); } }} disabled={frozen}
                style={{ ...btnBase, cursor: frozen ? "not-allowed" : "pointer", opacity: frozen ? 0.45 : 1, fontSize: 12, padding: "12px 22px", minHeight: 44, backgroundColor: "transparent", color: C.charcoal, border: `1px solid ${C.border}` }}>
                Modificar mi respuesta
              </button>
            )}
          </div>
        ) : (
          <>
            {modo === "nombres" ? (
              asignados.length > 0 && (
                <div style={{ width: "100%", maxWidth: 340, marginBottom: 24 }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontWeight: 600, fontSize: 17, color: C.charcoal, marginBottom: 14 }}>
                    Marca si asistirá cada persona de tu invitación.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {asignados.map((n, i) => (
                      <div key={i} style={{ backgroundColor: C.white, border: `1px solid ${eleccion[i] === "yes" ? C.gold : C.border}`, padding: "16px 14px 14px", transition: "border-color .25s" }}>
                        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: C.black, lineHeight: 1.25, marginBottom: 12 }}>{n}</p>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button type="button" disabled={bloqueado} aria-pressed={eleccion[i] === "yes"}
                            onClick={() => { setEleccion((e) => ({ ...e, [i]: "yes" })); setFeedback(""); }}
                            style={toggleBtn(eleccion[i] === "yes", C.black)}>Asistirá</button>
                          <button type="button" disabled={bloqueado} aria-pressed={eleccion[i] === "no"}
                            onClick={() => { setEleccion((e) => ({ ...e, [i]: "no" })); setFeedback(""); }}
                            style={toggleBtn(eleccion[i] === "no", C.charcoal)}>No asistirá</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <>
                {/* Toggle */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
                  <button type="button" disabled={bloqueado} onClick={() => { setChoice("yes"); setFeedback(""); }}
                    style={{ ...btnBase, backgroundColor: choice === "yes" ? C.black : "transparent", color: choice === "yes" ? C.white : C.charcoal, border: `1px solid ${choice === "yes" ? C.black : C.border}` }}>
                    Asistiré
                  </button>
                  <button type="button" disabled={bloqueado} onClick={() => { setChoice("no"); setFeedback(""); }}
                    style={{ ...btnBase, backgroundColor: choice === "no" ? C.charcoal : "transparent", color: choice === "no" ? C.white : C.charcoal, border: `1px solid ${choice === "no" ? C.charcoal : C.border}` }}>
                    No podré asistir
                  </button>
                </div>

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
                          disabled={bloqueado}
                          placeholder={`Nombre completo de invitado ${i + 1}`}
                          autoComplete="off"
                          onChange={(e) => {
                            const copy = [...nombres];
                            copy[i] = e.target.value;
                            setNombres(copy);
                          }}
                          style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, backgroundColor: C.white, fontFamily: "var(--font-body)", fontSize: 17, color: C.black, outline: "none" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Buenos deseos: llegan a la sección Mensajes del panel */}
            {nombre && !anulada && (modo === "pases" || asignados.length > 0) && (
              <div style={{ width: "100%", maxWidth: 340, marginBottom: 28, textAlign: "left" }}>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: C.softGray, marginBottom: 6 }}>
                  Buenos deseos para Raúl <span style={{ textTransform: "none", letterSpacing: "0.04em", fontWeight: 500 }}>(opcional)</span>
                </p>
                <textarea
                  value={mensaje}
                  disabled={bloqueado}
                  maxLength={1000}
                  rows={3}
                  placeholder="Déjale unas palabras a Raúl…"
                  onChange={(e) => setMensaje(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, backgroundColor: C.white, fontFamily: "var(--font-heading)", fontSize: 18, lineHeight: 1.5, color: C.black, outline: "none", resize: "vertical", minHeight: 96 }}
                />
              </div>
            )}

            {/* Confirm button */}
            <button
              className="rsvp-breathe"
              onClick={handleConfirm}
              disabled={loading || bloqueado || !nombre}
              style={{ ...btnBase, backgroundColor: C.black, color: C.white, paddingLeft: `calc(40px + .28em)` }}
            >
              {btnLabel}
            </button>
          </>
        )}

        {/* Feedback */}
        {(feedback || frozen || !nombre) && (
          <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 16, color: feedback ? feedbackColor : C.softGray, marginTop: 20, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
            {feedback || (frozen ? "El periodo de confirmación ya cerró." : "Abre el enlace personalizado que te enviaron para confirmar tu asistencia.")}
          </p>
        )}

        {mostrarGracias && gracias!.estado === "confirmado" && <CodigosAcceso qrs={qrs} pendientes={qrsPend} />}
      </motion.div>
    </section>
  );
}
