import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

const steps = [
  { n: "01", label: "DISCOVERY", title: "Understanding your vision", body: "We begin with a deep conversation. What are you building, for whom, and why? We study your references, your brand, your audience, and your objectives before touching a single polygon." },
  { n: "02", label: "CONCEPT", title: "Designing the creative approach", body: "Moodboards, styleframes, and conceptual documents define the visual language before production begins. This is where most of the creative thinking happens." },
  { n: "03", label: "BUILD", title: "Geometry, materials, and world", body: "Modeling, texturing, lighting, and scene construction. Precise, systematic, and built to iterate. Every asset is production-quality." },
  { n: "04", label: "MOTION", title: "Bringing it to life", body: "Animation, camera work, and motion design. For static projects, this phase covers composition and final render setup." },
  { n: "05", label: "REVISION", title: "Refinement rounds", body: "Structured feedback sessions. Your notes consolidated and addressed in systematic revision rounds. We track every change." },
  { n: "06", label: "DELIVERY", title: "Final files and handoff", body: "All deliverables exported in every required format. Clear documentation. Files organized for your team. Everything you need, nothing you don't." },
];

export default function Process() {
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
          <p className="label-orange mb-6">HOW WE WORK</p>
          <h1 className="text-[clamp(52px,8vw,120px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            THE PROCESS
          </h1>
        </div>
      </section>

      <section className="py-20 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[#bfc5cc] max-w-xl text-lg leading-relaxed mb-20 reveal">
            Every ORVEX project follows a disciplined creative process. Defined phases. Clear communication. No surprises.
          </p>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.n} className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr] gap-8 border-t border-white/5 py-12 md:py-16 reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="flex flex-col gap-2">
                  <span className="label-orange text-3xl font-700 leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{step.n}</span>
                  <span className="label-sm text-[#bfc5cc]/40">{step.label}</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-700 text-[#f5f7f8] tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{step.title}</h3>
                </div>
                <div>
                  <p className="text-[#bfc5cc] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-12 bg-[#14171b] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "COMMUNICATION", body: "Weekly updates. Clear timelines. No radio silence. You always know where we are." },
            { label: "FILE MANAGEMENT", body: "Every version tracked. Organized delivery. You receive everything in the formats you need." },
            { label: "CLIENT PORTAL", body: "Track your project status in real-time. Approve deliverables and send feedback directly." },
          ].map((item, i) => (
            <div key={item.label} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <p className="label-orange mb-4">{item.label}</p>
              <p className="text-[#bfc5cc] text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-8 md:px-12 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-700 text-[#f5f7f8] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>READY TO START?</h2>
          <p className="text-[#bfc5cc] mb-10">Book a discovery call or send us a brief. The process starts with a conversation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/book" className="btn-primary">BOOK A CALL <ArrowRight size={14} /></Link>
            <Link to="/contact" className="btn-secondary">SEND A BRIEF</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
