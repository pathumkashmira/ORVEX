import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Layout from "@/components/Layout";
import { projects, services, testimonials } from "@/data/seed";
import { useApp } from "@/contexts/AppContext";
import TextMaskReveal from "@/components/motion/TextMaskReveal";
import MagneticButton from "@/components/motion/MagneticButton";
import { useInView } from "@/motion/useInView";

/* ─────────────────────────────────────────────────────
   Orbital scene — pure CSS 3D animation
───────────────────────────────────────────────────── */
function OrbitalScene({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ perspective: "1100px", perspectiveOrigin: "50% 50%" }}
    >
      {/* Ambient radial glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,90,0,0.06) 0%, transparent 65%)",
        }} />
      </div>

      {/* Ring 1 */}
      <div className="orbital-ring orbital-ring-1" />
      {/* Ring 2 */}
      <div className="orbital-ring orbital-ring-2" />
      {/* Ring 3 */}
      <div className="orbital-ring orbital-ring-3" />

      {/* Orange traveling sphere — ring 1 */}
      <div className="absolute" style={{
        width: "320px", height: "320px",
        top: "50%", left: "50%", marginLeft: "-160px", marginTop: "-160px",
        animation: "spin-slow 8s linear infinite",
      }}>
        <div style={{
          position: "absolute", top: "-8px", left: "50%", marginLeft: "-8px",
          width: "16px", height: "16px", background: "#ff5a00", borderRadius: "50%",
          boxShadow: "0 0 28px rgba(255,90,0,1), 0 0 56px rgba(255,90,0,0.5), 0 0 100px rgba(255,90,0,0.15)",
        }} />
      </div>

      {/* Titanium sphere — ring 2 */}
      <div className="absolute" style={{
        width: "480px", height: "480px",
        top: "50%", left: "50%", marginLeft: "-240px", marginTop: "-240px",
        animation: "spin-slow-reverse 13s linear infinite",
      }}>
        <div style={{
          position: "absolute", top: "-5px", left: "50%", marginLeft: "-5px",
          width: "10px", height: "10px", background: "#bfc5cc", borderRadius: "50%",
          opacity: 0.5, boxShadow: "0 0 14px rgba(191,197,204,0.5)",
        }} />
      </div>

      {/* Cyan sphere — ring 3 */}
      <div className="absolute" style={{
        width: "600px", height: "600px",
        top: "50%", left: "50%", marginLeft: "-300px", marginTop: "-300px",
        animation: "spin-slow 20s linear infinite", animationDelay: "-6s",
      }}>
        <div style={{
          position: "absolute", top: "-4px", left: "50%", marginLeft: "-4px",
          width: "8px", height: "8px", background: "#00d9ff", borderRadius: "50%",
          opacity: 0.35, boxShadow: "0 0 12px rgba(0,217,255,0.6)",
        }} />
      </div>

      {/* Core */}
      <div style={{
        position: "absolute", width: "20px", height: "20px", borderRadius: "50%",
        border: "1px solid rgba(255,90,0,0.5)",
        top: "50%", left: "50%", marginLeft: "-10px", marginTop: "-10px",
        animation: "pulse-glow 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: "7px", height: "7px", borderRadius: "50%",
        background: "#f5f7f8",
        top: "50%", left: "50%", marginLeft: "-3.5px", marginTop: "-3.5px",
      }} />

      {/* Particles */}
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 5 === 0 ? "2px" : "1px",
          height: i % 5 === 0 ? "2px" : "1px",
          background: i % 4 === 0 ? "#ff5a00" : "#bfc5cc",
          borderRadius: "50%",
          top: `${12 + (i * 37) % 76}%`,
          left: `${8 + (i * 53) % 84}%`,
          opacity: 0.06 + (i % 6) * 0.025,
          animation: `particle-drift ${4 + (i % 8)}s ease-in-out infinite`,
          animationDelay: `${(i * 0.65) % 7}s`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Horizontal scrolling ticker
───────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "3D MODELING", "CGI VISUALIZATION", "3D MOTION", "PRODUCT VISUALIZATION",
  "BRAND & LOGO ANIMATION", "3D ADVERTISING", "DIGITAL ENVIRONMENTS", "CUSTOM CGI EXPERIENCES",
];

function Ticker() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-t border-b border-white/5 py-4" style={{ background: "#050608" }}>
      <div className="ticker-track">
        {repeated.map((item, i) => (
          <div key={i} className="flex items-center gap-8 px-8 flex-shrink-0">
            <span className="label-sm text-[#bfc5cc]/40 whitespace-nowrap">{item}</span>
            <div className="w-1 h-1 rounded-full bg-[#ff5a00] flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Scroll-reveal hook — adds .visible + stagger delay
───────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-slow, .reveal-left, .reveal-scale, .stat-reveal"
    );
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            el.style.transitionDelay = `${delay}s`;
            el.classList.add("visible");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────
   HOME
───────────────────────────────────────────────────── */
export default function Home() {
  useReveal();
  const { setCursorMode } = useApp();
  const orbitalRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Studio statement heading — shared IntersectionObserver for staggered TextMaskReveal
  const [studioRef, studioInView] = useInView<HTMLHeadingElement>({ threshold: 0.15 });

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Parallax: orbital drifts back slower; hero heading drifts very subtly */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const orbital = orbitalRef.current;
    const heading = heroHeadingRef.current;
    const handleScroll = () => {
      if (orbital) orbital.style.transform = `translateY(${window.scrollY * 0.14}px)`;
      if (heading) heading.style.transform = `translateY(${window.scrollY * -0.04}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featured = projects.filter((p) => p.featured);
  const experiments = projects.slice(0, 6);

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════════
          HERO — full viewport
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden flex flex-col bg-[#050608]">

        {/* Orbital — right side, with parallax ref */}
        <div
          ref={orbitalRef}
          className="absolute inset-0 pointer-events-none"
          style={{ left: "42%", willChange: "transform" }}
        >
          <OrbitalScene className="absolute inset-0" />
        </div>

        {/* Left vignette — text legibility */}
        <div
          className="absolute inset-y-0 left-0 pointer-events-none hidden md:block"
          style={{
            width: "55%",
            background: "linear-gradient(to right, #050608 55%, rgba(5,6,8,0.5) 80%, transparent 100%)",
          }}
        />

        {/* Horizontal scan line */}
        <div className="absolute left-0 right-0 h-px pointer-events-none" style={{
          background: "linear-gradient(to right, transparent 0%, rgba(255,90,0,0.12) 50%, transparent 100%)",
          animation: "scan-line 12s linear infinite",
          top: 0,
        }} />

        {/* Hero content — left column */}
        <div className="relative z-10 flex flex-col justify-between flex-1 px-8 md:px-16 pt-32 pb-14 min-h-screen">

          {/* Top label row */}
          <div
            className="flex items-center justify-between"
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s ease 0.2s" }}
          >
            <p className="label-orange">3D DESIGN / CGI / MOTION</p>
            <p className="label-sm text-[#bfc5cc]/30 hidden md:block">
              EST. 2020 &nbsp;&nbsp;·&nbsp;&nbsp; STUDIO
            </p>
          </div>

          {/* Main ORVEX display heading */}
          <div>
            <h1
              ref={heroHeadingRef}
              className="font-700 text-[#f5f7f8] leading-[0.86] tracking-[-0.055em]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(88px, 22vw, 320px)",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s",
                willChange: "transform",
              }}
            >
              ORVEX
            </h1>

            {/* Tagline */}
            <div
              className="mt-8 md:mt-10 flex items-baseline flex-wrap gap-x-4 gap-y-1"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 1s ease 0.55s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.55s",
              }}
            >
              <span
                className="text-[#bfc5cc]/60 font-700 tracking-[0.05em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vw, 38px)" }}
              >
                FORM.
              </span>
              <span
                className="text-[#ff5a00] font-700 tracking-[0.05em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vw, 38px)" }}
              >
                MOTION.
              </span>
              <span
                className="text-[#bfc5cc]/60 font-700 tracking-[0.05em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vw, 38px)" }}
              >
                BEYOND.
              </span>
            </div>
          </div>

          {/* Bottom row: body + CTAs + scroll */}
          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-10"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 1s ease 0.9s",
            }}
          >
            <div>
              <p className="text-[#bfc5cc]/55 text-[15px] max-w-[280px] leading-relaxed mb-8">
                Shaping digital worlds. From vision to dimension.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <MagneticButton strength={0.28}>
                  <Link
                    to="/work"
                    className="btn-primary"
                    onMouseEnter={() => setCursorMode("enter")}
                    onMouseLeave={() => setCursorMode("default")}
                  >
                    EXPLORE WORK <ArrowRight size={13} />
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.28}>
                  <Link
                    to="/contact"
                    className="btn-secondary"
                    onMouseEnter={() => setCursorMode("enter")}
                    onMouseLeave={() => setCursorMode("default")}
                  >
                    START A PROJECT
                  </Link>
                </MagneticButton>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="hidden md:flex flex-col items-center gap-3 self-end mb-2">
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#bfc5cc]/20 to-transparent" />
              <p className="label-sm text-[#bfc5cc]/30" style={{ writingMode: "vertical-rl", letterSpacing: "0.22em" }}>SCROLL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* ═══════════════════════════════════════════════════════
          01 — STUDIO STATEMENT
      ════════════════════════════════════════════════════════ */}
      <section className="py-40 md:py-56 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">

          {/* Section marker */}
          <div className="flex items-center gap-5 mb-20 reveal">
            <div className="w-8 h-px bg-[#ff5a00]" />
            <p className="label-orange">01 — STUDIO STATEMENT</p>
          </div>

          {/* Main statement — editorial large type */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-20 items-end mb-32">
            <h2
              ref={studioRef}
              className="text-[#f5f7f8] font-700 leading-[1.0] tracking-[-0.04em]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(44px, 6vw, 92px)",
              }}
            >
              <TextMaskReveal text="WE TURN IDEAS" externalInView={studioInView} delay={0} wordDelay={0.06} />
              <br />
              <TextMaskReveal text="INTO" externalInView={studioInView} delay={0.18} />
              {" "}
              <span className="text-[#bfc5cc]/45">
                <TextMaskReveal text="DIMENSIONAL" externalInView={studioInView} delay={0.26} wordDelay={0.065} />
              </span>
              <br />
              <TextMaskReveal text="EXPERIENCES." externalInView={studioInView} delay={0.38} wordDelay={0.07} />
            </h2>

            <div className="reveal" style={{ transitionDelay: "0.15s" }}>
              <p className="text-[#bfc5cc] text-[15px] leading-[1.8] mb-10">
                ORVEX is a 3D design and CGI studio creating visual systems, digital objects, motion, environments, and cinematic experiences for brands that demand precision and dimension.
              </p>
              <div className="flex flex-col gap-3">
                {["3D DESIGN", "CGI", "MOTION", "VISUALIZATION", "DIGITAL WORLDS", "ENVIRONMENTS"].map((s) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#ff5a00] flex-shrink-0" />
                    <p className="label-sm text-[#bfc5cc]/45">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats — large numbers in border grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5">
            {[
              { n: "120+", label: "Projects Delivered" },
              { n: "48",   label: "Global Clients" },
              { n: "6",    label: "Years Operating" },
              { n: "99%",  label: "Client Satisfaction" },
            ].map((s, i) => (
              <div
                key={i}
                className="border-r border-white/5 last:border-r-0 pt-12 pr-8 pb-4 reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <p
                  className="text-[#f5f7f8] font-700 leading-none mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(48px, 5.5vw, 80px)" }}
                >
                  {s.n}
                </p>
                <p className="label-sm text-[#bfc5cc]/40">{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          02 — FEATURED WORK
      ════════════════════════════════════════════════════════ */}
      <section className="pb-40 px-8 md:px-16 border-t border-white/5 pt-24">
        <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-16">
            <div className="reveal">
              <p className="label-orange mb-5">02 — FEATURED WORK</p>
              <h2
                className="font-700 tracking-[-0.035em] text-[#f5f7f8] leading-[0.95]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                SELECTED<br />PROJECTS
              </h2>
            </div>
            <Link
              to="/work"
              className="btn-ghost hidden md:flex items-center gap-2 reveal"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              VIEW ALL <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Asymmetric grid — row 1: 8+4 offset */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">

            {/* Project 1 — large left */}
            {featured[0] && (
              <Link
                to={`/work/${featured[0].slug}`}
                className="md:col-span-8 project-card block no-underline group reveal"
                onMouseEnter={() => setCursorMode("view")}
                onMouseLeave={() => setCursorMode("default")}
              >
                <div className="relative overflow-hidden bg-[#14171b]" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={featured[0].coverImage}
                    alt={featured[0].title}
                    className="project-card-img img-scale w-full h-full object-cover absolute inset-0"
                    loading="eager"
                  />
                  <div className="img-reveal-overlay" />
                  <div className="project-card-overlay" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-orange">{featured[0].category}</span>
                      <span className="label-sm text-[#bfc5cc]/40">ORVEX / {featured[0].number}</span>
                    </div>
                    <div>
                      <h3
                        className="text-[#f5f7f8] font-700 tracking-[-0.03em] mb-1 group-hover:text-[#ff5a00] transition-colors duration-400"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 3.5vw, 52px)" }}
                      >
                        {featured[0].title}
                      </h3>
                      <p className="text-[#bfc5cc]/60 text-sm mb-4">{featured[0].subtitle} · {featured[0].year}</p>
                      <div className="project-meta flex items-center gap-3">
                        <span className="label-sm text-[#bfc5cc]/45">{featured[0].software.slice(0, 2).join(" / ")}</span>
                        <span className="label-orange">VIEW PROJECT →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Project 2 — right, offset down */}
            {featured[1] && (
              <Link
                to={`/work/${featured[1].slug}`}
                className="md:col-span-4 project-card block no-underline group reveal"
                onMouseEnter={() => setCursorMode("view")}
                onMouseLeave={() => setCursorMode("default")}
                style={{ transitionDelay: "0.12s", marginTop: "clamp(0px, 8vw, 100px)" }}
              >
                <div className="relative overflow-hidden bg-[#14171b]" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={featured[1].coverImage}
                    alt={featured[1].title}
                    className="project-card-img img-scale w-full h-full object-cover absolute inset-0"
                    loading="lazy"
                  />
                  <div className="img-reveal-overlay" style={{ animationDelay: "0.12s" }} />
                  <div className="project-card-overlay" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <span className="badge badge-gray self-start">{featured[1].category}</span>
                    <div>
                      <h3
                        className="text-[#f5f7f8] font-700 tracking-[-0.025em] text-xl mb-1 group-hover:text-[#ff5a00] transition-colors"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                      >
                        {featured[1].title}
                      </h3>
                      <div className="project-meta">
                        <span className="label-orange text-[10px]">VIEW PROJECT →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Row 2 — full-width cinematic banner */}
          {featured[2] && (
            <Link
              to={`/work/${featured[2].slug}`}
              className="project-card block no-underline group reveal"
              onMouseEnter={() => setCursorMode("view")}
              onMouseLeave={() => setCursorMode("default")}
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="relative overflow-hidden bg-[#14171b]" style={{ aspectRatio: "21/7" }}>
                <img
                  src={featured[2].coverImage}
                  alt={featured[2].title}
                  className="project-card-img img-scale w-full h-full object-cover absolute inset-0"
                  loading="lazy"
                />
                <div className="img-reveal-overlay" style={{ animationDelay: "0.2s" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,6,8,0.85) 0%, rgba(5,6,8,0.2) 50%, transparent 100%)" }} />
                <div className="absolute inset-0 flex items-center px-10 md:px-14">
                  <div>
                    <p className="label-orange mb-3">{featured[2].category} · {featured[2].year}</p>
                    <h3
                      className="text-[#f5f7f8] font-700 tracking-[-0.03em] group-hover:text-[#ff5a00] transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3vw, 44px)" }}
                    >
                      {featured[2].title}
                    </h3>
                    <p className="text-[#bfc5cc]/60 text-sm mt-2 hidden md:block">{featured[2].subtitle}</p>
                    <div className="project-meta mt-4">
                      <span className="label-orange">VIEW PROJECT →</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          <div className="mt-6 md:hidden">
            <Link to="/work" className="btn-ghost">VIEW ALL WORK <ArrowUpRight size={13} /></Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          03 — SERVICES — editorial table
      ════════════════════════════════════════════════════════ */}
      <section className="py-40 border-t border-white/5" style={{ background: "#06080a" }}>
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">

          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-16 items-end mb-24">
            <div>
              <div className="flex items-center gap-5 mb-8 reveal">
                <div className="w-8 h-px bg-[#ff5a00]" />
                <p className="label-orange">03 — SERVICES</p>
              </div>
              <h2
                className="text-[#f5f7f8] font-700 leading-[0.95] tracking-[-0.04em] reveal"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(40px, 5.5vw, 84px)" }}
              >
                WHAT WE<br />CREATE.
              </h2>
            </div>
            <div className="reveal" style={{ transitionDelay: "0.1s" }}>
              <p className="text-[#bfc5cc] text-[15px] leading-[1.75] mb-10">
                From single hero renders to complete motion campaigns. Every engagement is built around your specific objectives, timeline, and platform.
              </p>
              <Link
                to="/services"
                className="btn-secondary"
                onMouseEnter={() => setCursorMode("enter")}
                onMouseLeave={() => setCursorMode("default")}
              >
                EXPLORE SERVICES <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Service table */}
          <div className="border-t border-white/5">
            {services.slice(0, 7).map((service, i) => (
              <Link
                key={service.id}
                to={`/services#${service.id}`}
                className="service-row no-underline group flex items-center gap-6 md:gap-10 py-6 px-2 reveal"
                style={{ transitionDelay: `${i * 0.06}s` }}
                onMouseEnter={() => setCursorMode("enter")}
                onMouseLeave={() => setCursorMode("default")}
              >
                {/* Large decorative number */}
                <span
                  className="service-row-num flex-shrink-0 select-none hidden md:block"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)", width: "100px", textAlign: "right" }}
                >
                  {service.number}
                </span>

                <span className="label-orange flex-shrink-0 md:hidden">{service.number}</span>

                {/* Name + desc */}
                <div className="flex-1 min-w-0">
                  <p
                    className="service-row-name text-[#f5f7f8] font-700 tracking-[-0.015em] transition-colors mb-0.5"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(16px, 1.8vw, 24px)" }}
                  >
                    {service.title}
                  </p>
                  <p className="text-[#bfc5cc]/45 text-xs leading-relaxed hidden md:block">{service.description}</p>
                </div>

                {/* Timeline */}
                <span className="label-sm text-[#bfc5cc]/30 flex-shrink-0 hidden lg:block w-28 text-right">
                  {service.timeline}
                </span>

                {/* Arrow */}
                <ArrowUpRight
                  size={16}
                  className="text-[#bfc5cc]/20 group-hover:text-[#ff5a00] transition-colors flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          04 — EXPERIMENTAL CGI
      ════════════════════════════════════════════════════════ */}
      <section className="py-40 px-8 md:px-16 border-t border-white/5 bg-[#050608]">
        <div className="max-w-[1400px] mx-auto">

          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-5 mb-6 reveal">
                <div className="w-8 h-px bg-[#ff5a00]" />
                <p className="label-orange">04 — EXPERIMENTS</p>
              </div>
              <h2
                className="text-[#f5f7f8] font-700 tracking-[-0.04em] leading-[0.95] reveal"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                INTERNAL<br />RESEARCH.
              </h2>
            </div>
            <p className="text-[#bfc5cc]/40 max-w-[200px] text-sm leading-relaxed text-right hidden md:block reveal" style={{ transitionDelay: "0.1s" }}>
              No briefs. No clients.<br />Pure curiosity.
            </p>
          </div>

          {/* Asymmetric 3×2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Row 1: 5 + 4 + 3 */}
            {[
              { cols: "md:col-span-5", aspect: "4/3", delay: "0s" },
              { cols: "md:col-span-4", aspect: "4/3", delay: "0.08s" },
              { cols: "md:col-span-3", aspect: "4/3", delay: "0.16s" },
              { cols: "md:col-span-3", aspect: "3/4", delay: "0.06s" },
              { cols: "md:col-span-4", aspect: "3/4", delay: "0.12s" },
              { cols: "md:col-span-5", aspect: "3/4", delay: "0.18s" },
            ].map((cfg, i) => {
              const exp = [
                { title: "LOOP 001", tech: "Blender / Geometry Nodes", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop&auto=format" },
                { title: "VOID", tech: "Cinema 4D / Redshift", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop&auto=format" },
                { title: "CARBON", tech: "Houdini / Mantra", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format" },
                { title: "DEEP", tech: "Blender / Cycles", img: "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=800&h=600&fit=crop&auto=format" },
                { title: "GRID", tech: "Cinema 4D / Octane", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format" },
                { title: "NOISE", tech: "Houdini / Arnold", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format" },
              ][i];
              return (
                <Link
                  key={i}
                  to="/experiments"
                  className={`${cfg.cols} exp-card block no-underline reveal`}
                  style={{ transitionDelay: cfg.delay }}
                  onMouseEnter={() => setCursorMode("view")}
                  onMouseLeave={() => setCursorMode("default")}
                >
                  <div className="relative overflow-hidden bg-[#14171b] w-full" style={{ aspectRatio: cfg.aspect }}>
                    <img
                      src={exp.img}
                      alt={exp.title}
                      className="exp-card-img w-full h-full object-cover absolute inset-0 opacity-80"
                      loading="lazy"
                    />
                    <div className="exp-card-overlay" />
                    <div className="exp-card-meta">
                      <p className="text-[#f5f7f8] font-700 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{exp.title}</p>
                      <p className="label-sm text-[#bfc5cc]/50">{exp.tech}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <Link
              to="/experiments"
              className="btn-ghost"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              ALL EXPERIMENTS <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          05 — PROCESS — horizontal timeline
      ════════════════════════════════════════════════════════ */}
      <section className="py-40 px-8 md:px-16 border-t border-white/5" style={{ background: "#080b0e" }}>
        <div className="max-w-[1400px] mx-auto">

          <div className="flex items-center gap-5 mb-20 reveal">
            <div className="w-8 h-px bg-[#ff5a00]" />
            <p className="label-orange">05 — PROCESS</p>
          </div>

          <h2
            className="font-700 text-[#f5f7f8] tracking-[-0.04em] leading-[0.95] mb-24 reveal"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 5vw, 72px)" }}
          >
            HOW WE<br />WORK.
          </h2>

          {/* 5-stage horizontal timeline */}
          <div className="relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute left-0 right-0 top-10 h-px bg-white/5" style={{ zIndex: 0 }} />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6">
              {[
                { num: "01", name: "DISCOVERY", desc: "Brief, objectives, scope, references and target audience. We ask the hard questions." },
                { num: "02", name: "CONCEPT", desc: "Moodboards, style frames, composition sketches and creative direction." },
                { num: "03", name: "BUILD", desc: "3D modeling, texturing, shading, and scene construction begin." },
                { num: "04", name: "MOTION", desc: "Animation, camera moves, lighting refinement and render passes." },
                { num: "05", name: "FINAL", desc: "Compositing, grading, delivery formats and client handoff." },
              ].map((stage, i) => (
                <div
                  key={stage.num}
                  className="relative reveal"
                  style={{ transitionDelay: `${i * 0.1}s`, zIndex: 1 }}
                >
                  {/* Stage number — large, decorative */}
                  <p
                    className="font-700 leading-none mb-6 select-none"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                      fontSize: "clamp(52px, 6vw, 88px)",
                      color: "rgba(191,197,204,0.1)",
                    }}
                  >
                    {stage.num}
                  </p>
                  <p className="label-orange mb-3">{stage.name}</p>
                  <p className="text-[#bfc5cc]/55 text-[13px] leading-[1.7]">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 reveal" style={{ transitionDelay: "0.5s" }}>
            <Link
              to="/process"
              className="btn-secondary"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              OUR PROCESS IN DETAIL <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          06 — STUDIO PHILOSOPHY — large pull quote
      ════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-[#050608]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-0 min-h-[640px]">

            {/* Quote block */}
            <div className="py-28 md:py-40 flex flex-col justify-between border-r border-white/5">
              <div className="flex items-center gap-5 mb-20 reveal">
                <div className="w-8 h-px bg-[#ff5a00]" />
                <p className="label-orange">06 — PHILOSOPHY</p>
              </div>

              <div>
                <blockquote
                  className="text-[#f5f7f8] font-700 leading-[1.08] tracking-[-0.03em] mb-12 reveal-slow"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3.2vw, 48px)" }}
                >
                  "EVERY RENDER IS A<br />
                  COMPOSITION. EVERY<br />
                  FRAME IS A DECISION."
                </blockquote>
                <p className="text-[#bfc5cc]/55 text-[15px] leading-[1.75] max-w-[440px] reveal" style={{ transitionDelay: "0.2s" }}>
                  We don't separate craft from concept. Technical precision and artistic vision are the same discipline at ORVEX. We build visuals that don't yet exist.
                </p>
              </div>

              <div className="mt-14 reveal" style={{ transitionDelay: "0.3s" }}>
                <Link
                  to="/studio"
                  className="btn-ghost"
                  onMouseEnter={() => setCursorMode("enter")}
                  onMouseLeave={() => setCursorMode("default")}
                >
                  ABOUT THE STUDIO <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Studio image */}
            <div className="relative overflow-hidden bg-[#14171b] hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=760&h=960&fit=crop&auto=format"
                alt="ORVEX Studio"
                className="w-full h-full object-cover opacity-65"
                loading="lazy"
                style={{ position: "absolute", inset: 0 }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #050608 0%, transparent 40%)" }} />
              <div className="absolute bottom-10 left-8">
                <p className="label-orange mb-1.5">ORVEX STUDIO</p>
                <p className="label-sm text-[#bfc5cc]/40">EST. 2020</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Testimonials — minimal strip
      ════════════════════════════════════════════════════════ */}
      <section className="py-32 px-8 md:px-16 border-t border-white/5" style={{ background: "#060809" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className="border border-white/6 p-8 flex flex-col reveal"
                style={{ transitionDelay: `${i * 0.1}s`, background: "rgba(20,23,27,0.4)" }}
              >
                <div className="flex gap-1.5 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-[#ff5a00]" />
                  ))}
                </div>
                <p className="text-[#f5f7f8] text-sm leading-[1.75] flex-1 mb-8">
                  &ldquo;{t.testimonial}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-[#f5f7f8] text-sm font-600" style={{ fontWeight: 600 }}>{t.name}</p>
                    <p className="label-sm text-[#bfc5cc]/45 mt-0.5">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          07 — CTA — oversized editorial type
      ════════════════════════════════════════════════════════ */}
      <section className="py-44 px-8 md:px-16 border-t border-white/5 bg-[#050608] relative overflow-hidden">
        {/* Orbital background motif — right aligned */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.04 }}>
          <div style={{ width: "800px", height: "800px", border: "1px solid #ff5a00", borderRadius: "50%", animation: "spin-slow 50s linear infinite" }} />
        </div>
        <div className="absolute right-20 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.025 }}>
          <div style={{ width: "560px", height: "560px", border: "1px solid #bfc5cc", borderRadius: "50%", animation: "spin-slow-reverse 35s linear infinite" }} />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex items-center gap-5 mb-16 reveal">
            <div className="w-8 h-px bg-[#ff5a00]" />
            <p className="label-orange">07 — START A PROJECT</p>
          </div>

          <h2
            className="font-700 text-[#f5f7f8] tracking-[-0.045em] leading-[0.91] mb-14 reveal"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(44px, 7.5vw, 120px)" }}
          >
            LET&rsquo;S BUILD<br />
            SOMETHING<br />
            <span className="text-[#ff5a00]">THAT DOESN&rsquo;T</span><br />
            <span className="text-[#ff5a00]">EXIST YET.</span>
          </h2>

          <p className="text-[#bfc5cc]/55 max-w-sm text-[15px] leading-[1.75] mb-14 reveal" style={{ transitionDelay: "0.1s" }}>
            Tell us about your project. We respond within 24 hours on business days.
          </p>

          <div className="flex flex-wrap items-center gap-5 reveal" style={{ transitionDelay: "0.2s" }}>
            <Link
              to="/contact"
              className="btn-primary"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              SEND A BRIEF <ArrowRight size={14} />
            </Link>
            <Link
              to="/book"
              className="btn-secondary"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              BOOK A CALL
            </Link>
            <Link
              to="/services"
              className="btn-ghost"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              BROWSE SERVICES <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
