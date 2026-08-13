import Layout from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[800px] mx-auto">
          <p className="label-orange mb-6">LEGAL</p>
          <h1 className="text-5xl font-700 text-[#f5f7f8] tracking-[-0.03em] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>TERMS OF SERVICE</h1>
          <p className="label-sm text-[#bfc5cc]/40">Last updated: August 13, 2026</p>
        </div>
      </section>
      <section className="py-16 px-8 md:px-12">
        <div className="max-w-[800px] mx-auto space-y-10">
          {[
            { h: "1. Acceptance of Terms", b: "By engaging ORVEX for services or accessing this website, you agree to these Terms of Service. If you do not agree, please do not use our services." },
            { h: "2. Services", b: "ORVEX provides 3D design, CGI visualization, motion design, and related creative services as described on our website. Specific deliverables, timelines, and terms for each project are defined in the project agreement." },
            { h: "3. Payment Terms", b: "All projects require a 50% deposit before production commences. The remaining 50% is due upon delivery of final files. Late payments may result in project suspension. All prices are in USD unless otherwise agreed." },
            { h: "4. Intellectual Property", b: "Full commercial rights to all final deliverable files transfer to the client upon receipt of full payment. ORVEX retains all rights to source files, unpublished work, and intermediate files. ORVEX may display finished work in its portfolio unless a confidentiality agreement is in place." },
            { h: "5. Revisions", b: "Each service package includes a set number of revision rounds as specified. Additional revisions may be purchased. Revisions must be submitted as consolidated feedback within 5 business days of each delivery." },
            { h: "6. Limitation of Liability", b: "ORVEX's total liability for any claim arising from our services shall not exceed the total fees paid for the specific project giving rise to the claim." },
            { h: "7. Governing Law", b: "These terms are governed by the laws of the European Union. Any disputes shall be resolved through binding arbitration." },
          ].map(({ h, b }) => (
            <div key={h}>
              <h2 className="text-xl font-700 text-[#f5f7f8] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{h}</h2>
              <p className="text-[#bfc5cc] leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
