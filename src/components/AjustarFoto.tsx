"use client";

import { useEffect, useRef, useState } from "react";

const OUT = 512; // resolução final exportada (px)

// Editor de foto: arrastar para posicionar + zoom. Exporta um quadrado
// recortado (data URL) que o currículo exibe em círculo.
export default function AjustarFoto({
  src,
  onAplicar,
  onCancelar,
}: {
  src: string;
  onAplicar: (dataUrl: string) => void;
  onCancelar: () => void;
}) {
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  // tamanho do viewport de edição — responsivo à largura da tela
  const [V, setV] = useState(288);

  useEffect(() => {
    const calc = () =>
      setV(Math.max(220, Math.min(288, window.innerWidth - 96)));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // carrega dimensões naturais
  useEffect(() => {
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  const base = nat ? Math.max(V / nat.w, V / nat.h) : 1;
  const drawW = nat ? nat.w * base * scale : V;
  const drawH = nat ? nat.h * base * scale : V;

  function clamp(o: { x: number; y: number }) {
    const mx = Math.max(0, (drawW - V) / 2);
    const my = Math.max(0, (drawH - V) / 2);
    return {
      x: Math.min(mx, Math.max(-mx, o.x)),
      y: Math.min(my, Math.max(-my, o.y)),
    };
  }

  // reajusta a posição quando o zoom ou o tamanho do viewport muda
  useEffect(() => {
    setOff((o) => clamp(o));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, nat, V]);

  function onDown(e: React.PointerEvent) {
    dragRef.current = { x: e.clientX - off.x, y: e.clientY - off.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    setOff(
      clamp({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y }),
    );
  }
  function onUp() {
    dragRef.current = null;
  }

  const left = V / 2 + off.x - drawW / 2;
  const top = V / 2 + off.y - drawH / 2;

  function aplicar() {
    if (!nat) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const f = OUT / V;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUT, OUT);
      ctx.drawImage(img, left * f, top * f, drawW * f, drawH * f);
      onAplicar(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = src;
  }

  return (
    <div
      className="nao-imprimir fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancelar}
    >
      <div
        className="cartao max-w-sm w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-base">Ajustar foto</h3>
        <p className="text-xs text-[var(--muted)] -mt-2">
          Arraste para posicionar e use o zoom. O círculo mostra o que vai
          aparecer.
        </p>

        <div className="grid place-items-center">
          <div
            className="relative overflow-hidden rounded-full border border-[var(--border)] touch-none cursor-grab active:cursor-grabbing"
            style={{ width: V, height: V, background: "#0a0f1e" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Ajuste"
              draggable={false}
              style={{
                position: "absolute",
                left,
                top,
                width: drawW,
                height: drawH,
                maxWidth: "none",
                userSelect: "none",
              }}
            />
            {/* anel guia */}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/40" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn btn-fantasma" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn-primario" onClick={aplicar}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
