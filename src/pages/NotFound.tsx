import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout hideFooter>
      <section className="min-h-screen flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[clamp(200px,30vw,400px)] font-700 text-white/[0.025] leading-none select-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            404
          </div>
        </div>
        <div className="relative z-10">
          <p className="label-orange mb-8">ERROR 404</p>
          <h1 className="text-[clamp(28px,4vw,56px)] font-700 text-[#f5f7f8] tracking-[-0.02em] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            THE DIMENSION<br />DOESN'T EXIST.
          </h1>
          <p className="text-[#bfc5cc] mb-12 max-w-sm">
            This page has drifted out of orbit. Let's get you back to a known dimension.
          </p>
          <Link to="/" className="btn-primary">RETURN TO ORVEX</Link>
        </div>
      </section>
    </Layout>
  );
}
