import { useState } from "react";
import { ArrowRight, MapPin, Mail, Clock } from "lucide-react";
import Layout from "@/components/Layout";

const projectTypes = [
  "3D Design", "CGI Visualization", "3D Motion", "Product Visualization",
  "Brand Animation", "3D Advertising", "Digital Environments", "Custom Experience", "Other",
];
const budgets = [
  "Under $2,000", "$2,000 – $5,000", "$5,000 – $10,000", "$10,000 – $25,000",
  "$25,000 – $50,000", "$50,000+", "Let's discuss",
];

interface FormState {
  name: string; company: string; email: string; phone: string;
  projectType: string; budget: string; timeline: string; message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "", company: "", email: "", phone: "",
    projectType: "", budget: "", timeline: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Layout>
      {/* Header */}
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-6">GET IN TOUCH</p>
          <h1 className="text-[clamp(36px,6vw,88px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            LET'S BUILD<br />SOMETHING THAT<br />
            <span className="text-[#ff5a00]">DOESN'T</span><br />
            EXIST YET.
          </h1>
        </div>
      </section>

      <section className="py-20 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px] gap-16">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="py-20 border border-[#ff5a00]/20 bg-[#ff5a00]/03 flex flex-col items-center justify-center text-center px-12">
                <div className="w-12 h-12 border border-[#ff5a00] rounded-full flex items-center justify-center mb-8">
                  <div className="w-3 h-3 bg-[#ff5a00] rounded-full" />
                </div>
                <h2 className="text-2xl font-700 text-[#f5f7f8] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>BRIEF RECEIVED.</h2>
                <p className="text-[#bfc5cc] mb-2">We'll be in touch within 24 hours on business days.</p>
                <p className="label-sm text-[#bfc5cc]/40">hello@orvex.studio</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="orvex-label">Full Name *</label>
                    <input required value={form.name} onChange={set("name")} className="orvex-input" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="orvex-label">Company</label>
                    <input value={form.company} onChange={set("company")} className="orvex-input" placeholder="Your company" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="orvex-label">Email *</label>
                    <input required type="email" value={form.email} onChange={set("email")} className="orvex-input" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="orvex-label">Phone</label>
                    <input type="tel" value={form.phone} onChange={set("phone")} className="orvex-input" placeholder="+1 555 000 0000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="orvex-label">Project Type *</label>
                    <div className="relative">
                      <select required value={form.projectType} onChange={set("projectType")} className="orvex-select pr-8">
                        <option value="">Select type</option>
                        {projectTypes.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="orvex-label">Budget Range</label>
                    <div className="relative">
                      <select value={form.budget} onChange={set("budget")} className="orvex-select">
                        <option value="">Select budget</option>
                        {budgets.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="orvex-label">Timeline</label>
                  <input value={form.timeline} onChange={set("timeline")} className="orvex-input" placeholder="e.g. 8 weeks, end of Q3, ASAP..." />
                </div>
                <div>
                  <label className="orvex-label">Project Brief *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={set("message")}
                    className="orvex-input resize-none"
                    rows={6}
                    placeholder="Tell us about your project. What are you building? What do you need? Any references or inspiration?"
                  />
                </div>
                <div>
                  <label className="orvex-label">Reference Files</label>
                  <div className="border border-dashed border-white/15 p-6 text-center hover:border-[#ff5a00]/40 transition-colors">
                    <p className="text-[#bfc5cc]/50 text-sm">Drop files here or click to upload</p>
                    <p className="label-sm text-[#bfc5cc]/30 mt-1">PNG, JPG, PDF, ZIP up to 50MB</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "SENDING..." : "SEND BRIEF"}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-8">
            <div className="border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={14} className="text-[#ff5a00]" />
                <p className="label-sm">DIRECT EMAIL</p>
              </div>
              <a href="mailto:hello@orvex.studio" className="text-[#f5f7f8] hover:text-[#ff5a00] transition-colors no-underline text-sm">
                hello@orvex.studio
              </a>
            </div>

            <div className="border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={14} className="text-[#ff5a00]" />
                <p className="label-sm">RESPONSE TIME</p>
              </div>
              <p className="text-[#f5f7f8] text-sm mb-1">Within 24 hours</p>
              <p className="label-sm text-[#bfc5cc]/40">Monday – Friday</p>
            </div>

            <div className="border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={14} className="text-[#ff5a00]" />
                <p className="label-sm">STUDIO</p>
              </div>
              <p className="text-[#f5f7f8] text-sm mb-1">Operating Globally</p>
              <p className="label-sm text-[#bfc5cc]/40">Remote-first studio</p>
            </div>

            <div className="border-t border-white/5 pt-8">
              <p className="label-sm text-[#bfc5cc]/40 mb-4">PREFER TO TALK?</p>
              <p className="text-[#bfc5cc] text-sm mb-6">
                Book a 30-minute discovery call. No obligation. Just a conversation about your project.
              </p>
              <a href="/book" className="btn-secondary w-full justify-center text-xs">
                BOOK A CALL
              </a>
            </div>

            <div className="border-t border-white/5 pt-8">
              <p className="label-sm text-[#bfc5cc]/40 mb-4">WE WORK WITH</p>
              <div className="space-y-2">
                {["Technology companies", "Luxury brands", "Architecture studios", "Advertising agencies", "Game studios", "Fashion brands"].map((c) => (
                  <p key={c} className="text-[#bfc5cc] text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff5a00] rounded-full flex-shrink-0" />
                    {c}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
