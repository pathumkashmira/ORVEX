import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

export default function Studio() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((e) => {
      e.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-6">THE STUDIO</p>
          <h1 className="text-[clamp(52px,8vw,120px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            STUDIO
          </h1>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-32 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-20 items-center">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#14171b] reveal">
            <img src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=1000&fit=crop&auto=format" alt="ORVEX Studio" className="w-full h-full object-cover opacity-80" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/60 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <p className="text-[clamp(48px,5vw,80px)] font-700 text-[#f5f7f8] tracking-[-0.04em] leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                FORM.<br /><span className="text-[#ff5a00]">BEYOND.</span>
              </p>
            </div>
          </div>

          <div className="reveal">
            <h2 className="text-[clamp(24px,2.5vw,38px)] font-700 tracking-[-0.02em] text-[#f5f7f8] mb-8 leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              ORVEX EXPLORES FORM, DIMENSIONALITY, MOTION, GEOMETRY, LIGHT, AND DIGITAL SPACE.
            </h2>
            <p className="text-[#bfc5cc] leading-relaxed mb-6">
              We were built on the belief that dimensional design — 3D, CGI, motion, and virtual environments — should be approached with the same rigor and creative ambition as any serious creative discipline.
            </p>
            <p className="text-[#bfc5cc] leading-relaxed mb-6">
              ORVEX works at the intersection of technical precision and artistic vision. We don't separate craft from concept. Every render is a composition. Every frame is a decision.
            </p>
            <p className="text-[#bfc5cc] leading-relaxed mb-12">
              We work with technology companies, luxury brands, architecture studios, advertising agencies, game studios, entertainment companies, and fashion brands. If your project demands imagery that doesn't yet exist, we're the right studio.
            </p>

            <div className="grid grid-cols-2 gap-8">
              {[
                { n: "2020", label: "Founded" },
                { n: "120+", label: "Projects" },
                { n: "48", label: "Clients" },
                { n: "Global", label: "Remote-first" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[clamp(24px,2.5vw,36px)] font-700 text-[#ff5a00] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{s.n}</p>
                  <p className="label-sm text-[#bfc5cc]/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-8 md:px-12 border-t border-white/5 bg-[#14171b]">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-16 reveal">WHAT WE BELIEVE</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-white/5">
            {[
              { n: "01", title: "PRECISION OVER QUANTITY", body: "We take fewer projects to do them better. Every engagement gets focused attention and genuine creative investment." },
              { n: "02", title: "CONCEPT DRIVES CRAFT", body: "Technical skill without artistic intent produces nothing meaningful. Every project begins with a clear conceptual foundation." },
              { n: "03", title: "DIMENSIONAL THINKING", body: "We approach every project as a spatial problem. How does the idea live in three dimensions? How does it move through time?" },
            ].map((v, i) => (
              <div key={v.n} className="border-b border-r border-white/5 p-8 md:p-10 reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <p className="label-orange mb-6">{v.n}</p>
                <h3 className="text-lg font-700 text-[#f5f7f8] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{v.title}</h3>
                <p className="text-[#bfc5cc] text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-8 md:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-16 reveal">THE TEAM</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Aleksei Orlov", role: "Founder & Creative Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&auto=format" },
              { name: "Yuna Mori", role: "Lead 3D Artist", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop&auto=format" },
              { name: "Dante Ferreira", role: "Motion Director", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=600&fit=crop&auto=format" },
            ].map((m, i) => (
              <div key={m.name} className="reveal group" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="aspect-[3/4] overflow-hidden bg-[#14171b] mb-5 relative">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/60 to-transparent" />
                </div>
                <h3 className="font-700 text-[#f5f7f8] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{m.name}</h3>
                <p className="label-sm text-[#bfc5cc]/60">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Software */}
      <section className="py-24 px-8 md:px-12 border-t border-white/5 bg-[#14171b]">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-12 reveal">OUR PIPELINE</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Blender", "Cinema 4D", "Houdini", "Substance 3D", "After Effects", "DaVinci Resolve", "Nuke", "Unreal Engine"].map((s, i) => (
              <div key={s} className="border border-white/5 p-5 hover:border-[#ff5a00]/30 transition-colors reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <p className="font-600 text-[#f5f7f8] text-sm" style={{ fontWeight: 600 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 md:px-12 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[clamp(28px,4vw,56px)] font-700 tracking-[-0.02em] text-[#f5f7f8] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>READY TO BUILD SOMETHING?</h2>
          <p className="text-[#bfc5cc] mb-10">Tell us about your project. We'll be in touch within 24 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary">START A PROJECT <ArrowRight size={14} /></Link>
            <Link to="/work" className="btn-secondary">VIEW OUR WORK</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
