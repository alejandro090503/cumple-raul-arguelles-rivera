"use client";

import { useRef, useState } from "react";

export function EnvelopeLoader({ children }: { children: React.ReactNode }) {
  const [fading, setFading] = useState(false);
  const [done,   setDone]   = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const audioRef  = useRef<HTMLAudioElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const tapped    = useRef(false);
  const revealed  = useRef(false);

  function handleOpen() {
    if (tapped.current) return;
    tapped.current = true;

    if (btnRef.current) btnRef.current.style.display = "none";

    const vid = videoRef.current;
    const img = imgRef.current;
    if (!vid || !img) return;

    const crossfade = () => {
      requestAnimationFrame(() => {
        vid.style.transition = "opacity 0.15s ease-in";
        vid.style.opacity    = "1";
        requestAnimationFrame(() => {
          img.style.transition = "opacity 0.15s ease-out";
          img.style.opacity    = "0";
        });
      });
    };

    vid.addEventListener("playing", function once() {
      vid.removeEventListener("playing", once);
      crossfade();
    });

    vid.play().catch(() => crossfade());
  }

  function handleVideoEnd() {
    setFading(true);
    setTimeout(() => {
      if (!revealed.current) revealInvitation();
    }, 1000);
  }

  function revealInvitation() {
    if (revealed.current) return;
    revealed.current = true;
    setDone(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("invitation:revealed"));
    }
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.55;
      audio.play().catch(() => {});
    }
  }

  function handleFadeOutEnd() {
    revealInvitation();
  }

  return (
    <>
      {/* Audio — preload silencioso, se reproduce al revelar la invitación */}
      <audio ref={audioRef} src="/cancion.mp3?v=2" preload="auto" loop />

      {/* Invitación siempre en DOM, visible debajo del loader */}
      {children}

      {/* Loader encima — se desvanece al terminar el video */}
      {!done && (
        <div
          ref={loaderRef}
          onTransitionEnd={fading ? handleFadeOutEnd : undefined}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#1a1612",
            zIndex: 9999,
            overflow: "hidden",
            opacity: fading ? 0 : 1,
            transition: fading ? "opacity 0.65s ease-out" : "none",
            pointerEvents: fading ? "none" : undefined,
          }}
        >
          {/* Video */}
          <video
            ref={videoRef}
            src="/sobre-abriendo.mp4"
            onEnded={handleVideoEnd}
            playsInline
            muted
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: 0,
              willChange: "opacity",
            }}
          />

          {/* Imagen sobre */}
          <img
            ref={imgRef}
            src="/sobre.jpg"
            alt="Sobre de invitación"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              userSelect: "none",
              WebkitUserSelect: "none",
              opacity: 1,
              willChange: "opacity",
              pointerEvents: "none",
            }}
          />

          {/* Botón */}
          <button
            ref={btnRef}
            onClick={handleOpen}
            style={{
              position: "absolute",
              bottom: "10vh",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "12px 24px",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 14 V6 a2 2 0 0 1 4 0 v8" />
              <path d="M14 10 V8 a2 2 0 0 1 4 0 v6" />
              <path d="M18 11 V9 a2 2 0 0 1 4 0 v10 c0 5-4 9-8 9 a8 8 0 0 1-8-8 v-5 a2 2 0 0 1 4 0 v4" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#D4AF37",
              }}
            >
              Toca para abrir
            </span>
          </button>
        </div>
      )}
    </>
  );
}
