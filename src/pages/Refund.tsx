import Layout from "@/components/Layout";

export default function Refund() {
  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[800px] mx-auto">
          <p className="label-orange mb-6">LEGAL</p>
          <h1 className="text-5xl font-700 text-[#f5f7f8] tracking-[-0.03em] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>REFUND POLICY</h1>
          <p className="label-sm text-[#bfc5cc]/40">Last updated: August 13, 2026</p>
        </div>
      </section>
      <section className="py-16 px-8 md:px-12">
        <div className="max-w-[800px] mx-auto space-y-10">
          {[
            { h: "Deposits", b: "The 50% project deposit is non-refundable once production has commenced. If ORVEX has not yet begun work, a full refund of the deposit can be issued within 48 hours of payment." },
            { h: "Cancellation Before Production", b: "If you cancel a project before production begins (within 48 hours of payment), you will receive a full refund. After 48 hours but before production begins, a 20% administrative fee applies." },
            { h: "Cancellation During Production", b: "If you cancel during production, you will be charged for all work completed to date at our standard day rate. Any amount paid in excess of the work completed will be refunded." },
            { h: "Final Deliverables", b: "Once final files have been delivered and approved, no refunds are available. If you identify a technical defect in the delivered files (corruption, incorrect format, missing elements), we will correct it at no charge." },
            { h: "Booking Cancellation", b: "Discovery calls and consultations cancelled with 24+ hours notice will be fully refunded. Cancellations within 24 hours are non-refundable but may be rescheduled once." },
            { h: "How to Request a Refund", b: "Email hello@orvex.studio with your order ID, booking reference, or project details. We will respond within 2 business days and process eligible refunds within 5–10 business days." },
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
