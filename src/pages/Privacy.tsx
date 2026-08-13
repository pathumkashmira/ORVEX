import Layout from "@/components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[800px] mx-auto">
          <p className="label-orange mb-6">LEGAL</p>
          <h1 className="text-5xl font-700 text-[#f5f7f8] tracking-[-0.03em] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>PRIVACY POLICY</h1>
          <p className="label-sm text-[#bfc5cc]/40">Last updated: August 13, 2026</p>
        </div>
      </section>
      <section className="py-16 px-8 md:px-12">
        <div className="max-w-[800px] mx-auto prose-orvex space-y-10">
          {[
            { h: "1. Information We Collect", b: "We collect information you provide directly to us — including name, email address, company name, phone number, and project details — when you submit a contact form, purchase a service, or book a consultation. We also collect usage data through analytics tools to improve our website and services." },
            { h: "2. How We Use Your Information", b: "We use your information to respond to inquiries, deliver services you've purchased, send booking confirmations and project updates, and occasionally send relevant studio updates (with your consent). We do not sell, rent, or share your personal information with third parties for marketing purposes." },
            { h: "3. Data Security", b: "We implement industry-standard security measures to protect your personal information. Payment information is processed by PCI-compliant payment providers. We never store raw card details on our servers." },
            { h: "4. Cookies", b: "We use essential cookies for website functionality and analytics cookies to understand how visitors use our site. You can disable non-essential cookies in your browser settings." },
            { h: "5. Your Rights", b: "You have the right to access, update, or delete your personal information. To exercise these rights or ask any questions about your data, contact us at hello@orvex.studio." },
            { h: "6. Contact", b: "For privacy-related questions, contact ORVEX at hello@orvex.studio." },
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
