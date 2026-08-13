import { useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);
  const { cursorMode } = useApp();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top = `${pos.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      if (labelRef.current) {
        labelRef.current.style.left = `${ring.current.x}px`;
        labelRef.current.style.top = `${ring.current.y}px`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf.current);
    };
  }, [isMobile]);

  if (isMobile) return null;

  const ringClass = `cursor-ring ${cursorMode === "view" || cursorMode === "enter" ? "view-mode" : ""}`;
  const label = cursorMode === "view" ? "VIEW" : cursorMode === "enter" ? "ENTER" : "";

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ display: cursorMode !== "default" ? "none" : undefined }} />
      <div ref={ringRef} className={ringClass} />
      {label && (
        <div ref={labelRef} className="cursor-label" style={{ fontSize: "9px", letterSpacing: "0.15em" }}>
          {label}
        </div>
      )}
    </>
  );
}
