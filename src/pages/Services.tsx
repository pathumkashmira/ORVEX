import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { services } from "@/data/seed";
import { useApp } from "@/contexts/AppContext";

export default function Services() {
  const [activeService, setActiveService] = useState(services[0].id);
  const { setCursorMode } = useApp();
  const current = services.find((s) => s.id === activeService) ?? services[0];

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((e) => {
      e.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [activeService]);

  return (
    <Layout>
      {/* Header */}
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-6">WHAT WE DO</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8">
            <h1 className="text-[clamp(52px,8vw,120px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              SERVICES
            </h1>
            <p className="text-[#bfc5cc] max-w-xs text-sm leading-relaxed">
              From single renders to complete visual systems. Built for brands that demand precision.
            </p>
          </div>
        </div>
      </section>

      {/* Services list + detail */}
      <section className="px-8 md:px-12 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0">
            {/* Service nav */}
            <div className="border-r border-white/5 pr-0 md:pr-8">
              <div className="sticky top-24">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className={`w-full text-left py-5 px-4 border-b border-white/5 flex items-center gap-4 group transition-all ${
                      activeService === service.id ? "bg-[#14171b]" : "hover:bg-[#14171b]/30"
                    }`}
                    id={service.id}
                  >
                    <span className={`label-sm flex-shrink-0 ${activeService === service.id ? "text-[#ff5a00]" : "text-[#bfc5cc]/40"}`}>
                      {service.number}
                    </span>
                    <div className="flex-1">
                      <p className={`font-600 text-sm transition-colors ${activeService === service.id ? "text-[#ff5a00]" : "text-[#f5f7f8] group-hover:text-[#ff5a00]"}`} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                        {service.title}
                      </p>
                    </div>
                    {activeService === service.id && (
                      <div className="w-1 h-full bg-[#ff5a00] absolute right-0 top-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Service detail */}
            <div className="pl-0 md:pl-12 pt-8 md:pt-0">
              <div key={current.id}>
                <div className="flex items-start gap-4 mb-8 reveal">
                  <span className="label-orange text-[36px] font-700 leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{current.number}</span>
                  <div>
                    <h2 className="text-[clamp(28px,3vw,48px)] font-700 tracking-[-0.02em] text-[#f5f7f8] leading-[1.0] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                      {current.title}
                    </h2>
                    <p className="text-[#bfc5cc] text-sm leading-relaxed max-w-lg">{current.overview}</p>
                  </div>
                </div>

                {/* Deliverables & Process */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 reveal">
                  <div>
                    <p className="label-orange mb-6">DELIVERABLES</p>
                    <ul className="list-none p-0 m-0 space-y-3">
                      {current.deliverables.map((d) => (
                        <li key={d} className="flex items-start gap-3">
                          <Check size={12} className="text-[#ff5a00] mt-1 flex-shrink-0" />
                          <span className="text-[#bfc5cc] text-sm">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="label-orange mb-6">PROCESS</p>
                    <ol className="list-none p-0 m-0 space-y-3">
                      {current.process.map((step, i) => (
                        <li key={step} className="flex items-start gap-3">
                          <span className="label-sm text-[#ff5a00] w-5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                          <span className="text-[#bfc5cc] text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <p className="label-sm text-[#bfc5cc]/40 mb-1">TYPICAL TIMELINE</p>
                      <p className="text-[#f5f7f8] text-sm font-500" style={{ fontWeight: 500 }}>{current.timeline}</p>
                    </div>
                  </div>
                </div>

                {/* Packages */}
                {current.packages.length > 0 ? (
                  <div className="reveal">
                    <p className="label-orange mb-8">PACKAGES</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {current.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`border p-6 relative ${pkg.popular ? "border-[#ff5a00]" : "border-white/10"}`}
                        >
                          {pkg.popular && (
                            <div className="absolute -top-px left-6 right-6 h-[1px] bg-[#ff5a00]" />
                          )}
                          {pkg.popular && (
                            <span className="absolute -top-3 left-6 badge badge-orange">MOST POPULAR</span>
                          )}
                          <p className="label-sm mb-4">{pkg.name}</p>
                          <div className="mb-2">
                            <span className="text-[clamp(28px,3vw,40px)] font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                              ${pkg.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[#bfc5cc] text-xs mb-1">{pkg.description}</p>
                          <p className="label-sm text-[#bfc5cc]/40 mb-6">{pkg.duration}</p>
                          <ul className="list-none p-0 m-0 space-y-2 mb-8">
                            {pkg.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-[#bfc5cc] text-xs">
                                <Check size={10} className="text-[#ff5a00] flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Link
                            to={`/checkout?service=${current.id}&package=${pkg.id}`}
                            className={pkg.popular ? "btn-primary w-full justify-center text-xs py-3" : "btn-secondary w-full justify-center text-xs py-3"}
                            onMouseEnter={() => setCursorMode("enter")}
                            onMouseLeave={() => setCursorMode("default")}
                          >
                            SELECT PACKAGE
                          </Link>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <p className="text-[#bfc5cc] text-sm">Need a custom solution?</p>
                      <Link to="/contact" className="btn-ghost">REQUEST A QUOTE <ArrowRight size={12} /></Link>
                    </div>
                  </div>
                ) : (
                  <div className="reveal border border-white/10 p-8 text-center">
                    <p className="text-[#f5f7f8] font-600 mb-3" style={{ fontWeight: 600 }}>CUSTOM ENGAGEMENT</p>
                    <p className="text-[#bfc5cc] text-sm mb-8 max-w-md mx-auto">
                      {current.description} Every engagement is scoped individually. Let's discuss your specific project.
                    </p>
                    <Link to="/contact" className="btn-primary">
                      START CONVERSATION <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 md:px-12 border-t border-white/5 bg-[#14171b]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[clamp(28px,3vw,52px)] font-700 tracking-[-0.02em] text-[#f5f7f8] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              NOT SURE WHICH<br />SERVICE YOU NEED?
            </h2>
            <p className="text-[#bfc5cc] leading-relaxed mb-8">
              Book a free 30-minute discovery call. We'll talk through your project and recommend the right approach.
            </p>
            <Link to="/book" className="btn-primary">
              BOOK A DISCOVERY CALL <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { q: "How long does a project take?", a: "Depends on scope. Most CGI projects: 5–20 days." },
              { q: "Do you offer rush delivery?", a: "Yes, at 40–60% premium. Ask us." },
              { q: "What's included in revisions?", a: "Each round covers all consolidated feedback." },
              { q: "Do I own the final files?", a: "Full commercial rights transfer on final payment." },
            ].map((faq, i) => (
              <div key={i} className="border border-white/5 p-5">
                <p className="text-[#f5f7f8] text-xs font-600 mb-2" style={{ fontWeight: 600 }}>{faq.q}</p>
                <p className="text-[#bfc5cc] text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
