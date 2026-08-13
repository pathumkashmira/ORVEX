import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { projects, type Project } from "@/data/seed";
import { useApp } from "@/contexts/AppContext";

const CATEGORIES = ["ALL", ...Array.from(new Set(projects.map((p) => p.category)))];

export default function Work() {
  const navigate = useNavigate();
  const { setCursorMode } = useApp();
  const [filter, setFilter] = useState("ALL");
  const [transitioning, setTransitioning] = useState(false);

  const handleProjectClick = useCallback(
    (slug: string) => {
      setTransitioning(true);
      setTimeout(() => navigate(`/work/${slug}`), 560);
    },
    [navigate]
  );

  const handleEnter = useCallback(() => setCursorMode("view"), [setCursorMode]);
  const handleLeave = useCallback(() => setCursorMode("default"), [setCursorMode]);

  const isVisible = (cat: string) => filter === "ALL" || cat === filter;
  const visibleCount =
    filter === "ALL" ? projects.length : projects.filter((p) => p.category === filter).length;

  return (
    <Layout hideFooter>
      {/* Transition overlay */}
      <div
        className="fixed inset-0 z-[9990] bg-[#050608] pointer-events-none"
        style={{
          opacity: transitioning ? 1 : 0,
          transition: transitioning
            ? "opacity 0.55s cubic-bezier(0.4,0,0.2,1)"
            : "opacity 0.2s ease",
        }}
      />

      <div className="pt-[72px]">
        {/* Page header */}
        <header className="px-8 md:px-16 pt-16 pb-14 border-b border-white/5">
          <div className="flex items-end justify-between gap-12 flex-wrap">
            <div>
              <p
                className="mb-4"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(191,197,204,0.45)",
                }}
              >
                ORVEX — SELECTED WORK
              </p>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(80px, 16vw, 260px)",
                  letterSpacing: "-0.055em",
                  lineHeight: 0.86,
                  color: "#f5f7f8",
                }}
              >
                WORK
              </h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-6 pb-2">
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`work-filter-btn ${filter === cat ? "active" : ""}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  color: "rgba(191,197,204,0.3)",
                }}
              >
                {visibleCount} PROJECT{visibleCount !== 1 ? "S" : ""}
              </p>
            </div>
          </div>
        </header>

        {/* Editorial grid */}
        <div className="px-4 md:px-6 py-4 flex flex-col gap-2">

          {/* 001 — full width tall */}
          <ProjectItem
            project={projects[0]}
            dimmed={!isVisible(projects[0].category)}
            height="clamp(400px, 62vh, 740px)"
            onClick={handleProjectClick}
            onHoverEnter={handleEnter}
            onHoverLeave={handleLeave}
          />

          {/* 002 + 003 — asymmetric pair */}
          <div className="flex gap-2 items-start">
            <div style={{ flex: "0 0 58%" }}>
              <ProjectItem
                project={projects[1]}
                dimmed={!isVisible(projects[1].category)}
                height="clamp(340px, 50vh, 620px)"
                onClick={handleProjectClick}
                onHoverEnter={handleEnter}
                onHoverLeave={handleLeave}
              />
            </div>
            <div
              style={{
                flex: "0 0 calc(42% - 8px)",
                marginTop: "clamp(44px, 7vw, 100px)",
              }}
            >
              <ProjectItem
                project={projects[2]}
                dimmed={!isVisible(projects[2].category)}
                height="clamp(400px, 58vh, 720px)"
                onClick={handleProjectClick}
                onHoverEnter={handleEnter}
                onHoverLeave={handleLeave}
              />
            </div>
          </div>

          {/* 004 — cinematic wide strip */}
          <ProjectItem
            project={projects[3]}
            dimmed={!isVisible(projects[3].category)}
            height="clamp(200px, 30vh, 400px)"
            onClick={handleProjectClick}
            onHoverEnter={handleEnter}
            onHoverLeave={handleLeave}
            wideLayout
          />

          {/* 005 + 006 — reversed asymmetric pair */}
          <div className="flex gap-2 items-start">
            <div style={{ flex: "0 0 44%" }}>
              <ProjectItem
                project={projects[4]}
                dimmed={!isVisible(projects[4].category)}
                height="clamp(380px, 54vh, 660px)"
                onClick={handleProjectClick}
                onHoverEnter={handleEnter}
                onHoverLeave={handleLeave}
              />
            </div>
            <div
              style={{
                flex: "0 0 calc(56% - 8px)",
                marginTop: "clamp(56px, 8vw, 128px)",
              }}
            >
              <ProjectItem
                project={projects[5]}
                dimmed={!isVisible(projects[5].category)}
                height="clamp(300px, 42vh, 520px)"
                onClick={handleProjectClick}
                onHoverEnter={handleEnter}
                onHoverLeave={handleLeave}
              />
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-white/5 px-8 md:px-16 py-12 flex items-center justify-between mt-4">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.2em",
              color: "rgba(191,197,204,0.3)",
            }}
          >
            ALL WORK © ORVEX STUDIO 2026
          </p>
          <a href="/contact" className="btn-primary text-xs py-3 px-7">
            START A PROJECT
          </a>
        </div>
      </div>
    </Layout>
  );
}

interface ProjectItemProps {
  project: Project;
  dimmed: boolean;
  height: string;
  onClick: (slug: string) => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  wideLayout?: boolean;
}

function ProjectItem({
  project,
  dimmed,
  height,
  onClick,
  onHoverEnter,
  onHoverLeave,
  wideLayout,
}: ProjectItemProps) {
  return (
    <div
      className="work-item"
      style={{
        height,
        opacity: dimmed ? 0.14 : 1,
        transition: "opacity 0.45s ease",
        pointerEvents: dimmed ? "none" : "auto",
      }}
      onClick={() => onClick(project.slug)}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(project.slug)}
      aria-label={`View project ${project.title}`}
    >
      <img
        src={project.coverImage}
        alt={project.title}
        className="work-item-img"
        loading="lazy"
      />
      <div className="work-item-overlay" />

      {/* Top badge */}
      <div className="work-item-badge">ORVEX / {project.number}</div>

      {/* Bottom metadata */}
      <div
        className="work-item-meta"
        style={wideLayout ? { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" } : {}}
      >
        <div>
          <div className="work-item-cat">
            <span>{project.category}</span>
            <span className="work-item-cat-divider" />
            <span>{project.year}</span>
            {project.client !== "Internal" && (
              <>
                <span className="work-item-cat-divider" />
                <span>{project.client}</span>
              </>
            )}
          </div>
          <div className="work-item-title">{project.title}</div>
          <div className="work-item-view">
            <div className="work-item-view-line" />
            <span>VIEW PROJECT</span>
          </div>
        </div>

        {wideLayout && (
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(11px, 1vw, 14px)",
              color: "rgba(191,197,204,0.45)",
              maxWidth: "300px",
              lineHeight: 1.5,
              textAlign: "right",
              fontWeight: 400,
            }}
          >
            {project.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
