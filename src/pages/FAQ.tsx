import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Layout from "@/components/Layout";
import { faqs } from "@/data/seed";

const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-6">FREQUENTLY ASKED</p>
          <h1 className="text-[clamp(52px,7vw,100px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            FAQ
          </h1>
        </div>
      </section>

      <section className="py-16 px-8 md:px-12">
        <div className="max-w-[900px] mx-auto">
          <div className="flex gap-2 flex-wrap mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[10px] font-700 tracking-[0.14em] uppercase border transition-all ${activeCategory === cat ? "border-[#ff5a00] text-[#ff5a00]" : "border-white/10 text-[#bfc5cc] hover:border-white/30"}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-0">
            {filtered.map(faq => (
              <div key={faq.id} className="border-t border-white/5">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full text-left py-6 flex items-center gap-4 group"
                >
                  <span className="label-orange flex-shrink-0 w-5">{faq.id.padStart(2, "0")}</span>
                  <p className="flex-1 font-600 text-[#f5f7f8] group-hover:text-[#ff5a00] transition-colors" style={{ fontWeight: 600 }}>
                    {faq.question}
                  </p>
                  <div className="flex-shrink-0 text-[#bfc5cc]/40">
                    {openId === faq.id ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                {openId === faq.id && (
                  <div className="pb-8 pl-9">
                    <p className="text-[#bfc5cc] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-12 text-center">
            <p className="text-[#bfc5cc] mb-6">Have another question?</p>
            <a href="/contact" className="btn-primary">CONTACT US</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
