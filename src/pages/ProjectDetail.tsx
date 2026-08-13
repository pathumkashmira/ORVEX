import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { projects } from "@/data/seed";
import { useApp } from "@/contexts/AppContext";

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setCursorMode } = useApp();
  const [visible, setVisible] = useState(false);
  const [parallax, setParallax] = useState(0);
  const heroImgRef = useRef<HTMLImageElement>(null);

  const project = projects.find((p) => p.slug === slug);
  const projectIndex = project ? projects.findIndex((p) => p.slug === slug) : -1;
  const nextProject = project ? projects[(projectIndex + 1) % projects.length] : null;

  useEffect(() => {
    if (!project) {
      navigate("/work");
      return;
    }
    const t = setTimeout(() => setVisible(true), 80);

    const onScroll = () => setParallax(window.scrollY * 0.28);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [project, navigate]);

  if (!project || !nextProject) return null;

  return (
    <Layout hideFooter>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.65s ease",
        }}
      >
        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ height: "100svh" }}>
          <img
            ref={heroImgRef}
            src={project.coverImage}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `translateY(${parallax}px) scale(1.12)`,
              transformOrigin: "center top",
              transition: "transform 0.05s linear",
            }}
          />

          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(5,6,8,1) 0%, rgba(5,6,8,0.55) 45%, rgba(5,6,8,0.08) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(5,6,8,0.55) 0%, transparent 65%)",
            }}
          />

          {/* Project number watermark */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              bottom: "-0.1em",
              right: "clamp(16px, 3vw, 48px)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(120px, 26vw, 420px)",
              letterSpacing: "-0.06em",
              lineHeight: 1,
              color: "rgba(255,255,255,0.035)",
            }}
          >
            {project.number}
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12">
            <p
              className="mb-5"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(191,197,204,0.5)",
              }}
            >
              ORVEX / {project.number}
            </p>

            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(48px, 9.5vw, 148px)",
                letterSpacing: "-0.048em",
                lineHeight: 0.9,
                color: "#f5f7f8",
                marginBottom: "clamp(12px, 2vw, 32px)",
              }}
            >
              {project.title}
            </h1>

            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(12px, 1.1vw, 16px)",
                fontWeight: 400,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(191,197,204,0.55)",
              }}
            >
              {project.subtitle}
            </p>

            {/* Horizontal meta bar */}
            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/[0.09]">
              <MetaItem label="Client" value={project.client} />
              <MetaItem label="Category" value={project.category} />
              <MetaItem label="Year" value={String(project.year)} />
              <MetaItem label="Software" value={project.software.slice(0, 3).join(", ")} />
              <MetaItem label="Status" value={project.status.toUpperCase()} />
            </div>
          </div>
        </section>

        {/* ── PROJECT STATEMENT ── */}
        <section className="px-8 md:px-16 py-24 md:py-36 grid md:grid-cols-12 gap-6 md:gap-10">
          <div className="md:col-span-1 pt-1">
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#ff5a00",
                display: "block",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              STATEMENT
            </span>
          </div>
          <div className="md:col-start-3 md:col-span-10">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(20px, 2.8vw, 40px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                color: "#f5f7f8",
              }}
            >
              {project.description}
            </p>
          </div>
        </section>

        <div className="border-t border-white/[0.06] mx-8 md:mx-16" />

        {/* ── GALLERY ── */}
        <section className="py-4 flex flex-col gap-2">
          {/* First image: full bleed, wide aspect */}
          {project.gallery[0] && (
            <div className="overflow-hidden" style={{ aspectRatio: "21/9" }}>
              <img
                src={`${project.gallery[0].split("?")[0]}?w=2400&h=1029&fit=crop&auto=format`}
                alt={`${project.title} — hero`}
                className="project-gallery-img"
                style={{ height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
          )}

          {/* Remaining images: equal columns */}
          {project.gallery.length > 1 && (
            <div className="flex gap-2">
              {project.gallery.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="overflow-hidden"
                  style={{ flex: 1, aspectRatio: "4/3" }}
                >
                  <img
                    src={`${img.split("?")[0]}?w=900&h=675&fit=crop&auto=format`}
                    alt={`${project.title} — detail ${i + 2}`}
                    className="project-gallery-img"
                    style={{ height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── CHALLENGE + CONCEPT ── */}
        <section className="px-8 md:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <p
              className="mb-7"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#ff5a00",
              }}
            >
              THE CHALLENGE
            </p>
            <p
              style={{
                color: "rgba(191,197,204,0.8)",
                fontSize: "clamp(15px, 1.3vw, 19px)",
                lineHeight: 1.75,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {project.challenge}
            </p>
          </div>
          <div>
            <p
              className="mb-7"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(191,197,204,0.35)",
              }}
            >
              THE CONCEPT
            </p>
            <p
              style={{
                color: "rgba(191,197,204,0.7)",
                fontSize: "clamp(15px, 1.3vw, 19px)",
                lineHeight: 1.75,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {project.concept}
            </p>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="border-t border-white/[0.06]">
          <div className="px-8 md:px-16 py-20 md:py-28">
            <div className="flex items-start gap-16 flex-wrap md:flex-nowrap">
              <div className="flex-shrink-0">
                <p
                  className="mb-0"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(191,197,204,0.35)",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  PROCESS
                </p>
              </div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(18px, 2.2vw, 30px)",
                  fontWeight: 400,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.55,
                  color: "rgba(191,197,204,0.7)",
                  maxWidth: "880px",
                }}
              >
                {project.process}
              </p>
            </div>
          </div>
        </section>

        {/* ── TECHNICAL DETAILS ── */}
        <section className="border-t border-white/[0.06]">
          <div className="px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            {/* Services */}
            <div>
              <p
                className="mb-5"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(191,197,204,0.35)",
                }}
              >
                SERVICES
              </p>
              <div className="flex flex-col gap-2">
                {project.services.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#f5f7f8",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Software */}
            <div>
              <p
                className="mb-5"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(191,197,204,0.35)",
                }}
              >
                SOFTWARE
              </p>
              <div className="flex flex-col gap-2">
                {project.software.map((sw) => (
                  <span
                    key={sw}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "rgba(191,197,204,0.7)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      border: "1px solid rgba(191,197,204,0.1)",
                      padding: "4px 10px",
                      display: "inline-block",
                      marginBottom: "4px",
                      width: "fit-content",
                    }}
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p
                className="mb-5"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(191,197,204,0.35)",
                }}
              >
                TAGS
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "rgba(191,197,204,0.45)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Year + client */}
            <div>
              <p
                className="mb-5"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(191,197,204,0.35)",
                }}
              >
                PROJECT INFO
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "10px",
                      color: "rgba(191,197,204,0.4)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Year
                  </p>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#f5f7f8",
                    }}
                  >
                    {project.year}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "10px",
                      color: "rgba(191,197,204,0.4)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Client
                  </p>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#f5f7f8",
                    }}
                  >
                    {project.client}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── START A PROJECT CTA ── */}
        <section className="border-t border-white/[0.06] px-8 md:px-16 py-14 flex items-center justify-between gap-6 flex-wrap">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(15px, 1.6vw, 22px)",
              fontWeight: 500,
              color: "rgba(191,197,204,0.6)",
              letterSpacing: "-0.01em",
            }}
          >
            Interested in working with ORVEX?
          </p>
          <a href="/contact" className="btn-primary py-4 px-8">
            START A PROJECT
          </a>
        </section>

        {/* ── NEXT PROJECT ── */}
        <section
          className="next-project-section"
          style={{ height: "clamp(260px, 38vh, 480px)" }}
          onClick={() => {
            setCursorMode("default");
            navigate(`/work/${nextProject.slug}`);
          }}
          onMouseEnter={() => setCursorMode("view")}
          onMouseLeave={() => setCursorMode("default")}
        >
          <img
            src={nextProject.coverImage}
            alt={nextProject.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.3 }}
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #050608 40%, rgba(5,6,8,0.6) 75%, rgba(5,6,8,0.2) 100%)",
            }}
          />

          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 gap-3">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#ff5a00",
              }}
            >
              NEXT DIMENSION
            </p>

            <div className="flex items-center gap-5">
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(36px, 7vw, 112px)",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.92,
                  color: "#f5f7f8",
                }}
              >
                {nextProject.title}
              </span>
              <span
                className="next-project-arrow"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(28px, 5vw, 80px)",
                  color: "#ff5a00",
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                →
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(191,197,204,0.4)",
              }}
            >
              {nextProject.category} · {nextProject.year}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(191,197,204,0.35)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          color: "#f5f7f8",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {value}
      </span>
    </div>
  );
}
