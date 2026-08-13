import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";

const experiments = [
  { id: "1", title: "LOOP 001", subtitle: "Infinite orbital recursion", year: "2026", tech: "Blender / Geometry Nodes", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop&auto=format" },
  { id: "2", title: "VOID", subtitle: "Material study in darkness", year: "2026", tech: "Cinema 4D / Redshift", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop&auto=format" },
  { id: "3", title: "CARBON", subtitle: "Fiber weave geometry", year: "2025", tech: "Houdini / Mantra", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format" },
  { id: "4", title: "DEEP", subtitle: "Subsurface scattering study", year: "2025", tech: "Blender / Cycles", img: "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=800&h=600&fit=crop&auto=format" },
  { id: "5", title: "GRID", subtitle: "Parametric surface tension", year: "2025", tech: "Cinema 4D / Octane", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format" },
  { id: "6", title: "NOISE", subtitle: "Procedural displacement field", year: "2024", tech: "Houdini / Arnold", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format" },
];

export default function Experiments() {
  const { setCursorMode } = useApp();
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((e) => { e.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); }); }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-6">STUDIO EXPERIMENTS</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8">
            <h1 className="text-[clamp(52px,8vw,120px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              EXPERIMENTS
            </h1>
            <p className="text-[#bfc5cc] max-w-xs text-sm leading-relaxed">
              Internal research, material studies, and creative explorations. No briefs. No clients. Just curiosity.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {experiments.map((exp, i) => {
              const isLarge = i === 0 || i === 3;
              const colClass = isLarge ? "md:col-span-8" : "md:col-span-4";
              const aspectClass = isLarge ? "aspect-[16/9]" : "aspect-[4/3]";
              return (
                <div
                  key={exp.id}
                  className={`project-card ${colClass} reveal`}
                  onMouseEnter={() => setCursorMode("view")}
                  onMouseLeave={() => setCursorMode("default")}
                  style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
                >
                  <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#14171b]`}>
                    <img src={exp.img} alt={exp.title} className="project-card-img w-full h-full object-cover" loading="lazy" />
                    <div className="project-card-overlay" />
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="badge badge-gray">EXPERIMENT</span>
                        <p className="label-sm text-[#bfc5cc]/60">{exp.year}</p>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-700 text-[#f5f7f8] tracking-[-0.02em] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                          {exp.title}
                        </h3>
                        <p className="text-[#bfc5cc] text-sm mb-3">{exp.subtitle}</p>
                        <div className="project-meta">
                          <p className="label-sm text-[#bfc5cc]/50">{exp.tech}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="label-orange mb-6">CURIOUS?</p>
          <h2 className="text-3xl font-700 text-[#f5f7f8] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>FOLLOW THE WORK IN PROGRESS.</h2>
          <p className="text-[#bfc5cc] mb-8">Behind-the-scenes experiments and studio R&D. Follow ORVEX on social.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="btn-secondary">INSTAGRAM <ArrowUpRight size={14} /></a>
            <Link to="/journal" className="btn-ghost">READ THE JOURNAL <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
