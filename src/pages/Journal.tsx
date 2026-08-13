import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { journalPosts } from "@/data/seed";
import { useApp } from "@/contexts/AppContext";

export default function Journal() {
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
          <p className="label-orange mb-6">STUDIO JOURNAL</p>
          <h1 className="text-[clamp(52px,8vw,120px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            JOURNAL
          </h1>
        </div>
      </section>

      <section className="py-16 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Featured post */}
          <Link
            to={`/journal/${journalPosts[0].slug}`}
            className="block no-underline mb-16 group reveal"
            onMouseEnter={() => setCursorMode("view")}
            onMouseLeave={() => setCursorMode("default")}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-0 border border-white/5 overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-[#14171b]">
                <img src={journalPosts[0].coverImage} alt={journalPosts[0].title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-between bg-[#14171b]">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="badge badge-orange">{journalPosts[0].category}</span>
                    <div className="flex items-center gap-1 label-sm text-[#bfc5cc]/40">
                      <Clock size={10} /> {journalPosts[0].readTime} min
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-700 text-[#f5f7f8] tracking-[-0.02em] mb-4 group-hover:text-[#ff5a00] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                    {journalPosts[0].title}
                  </h2>
                  <p className="text-[#bfc5cc] leading-relaxed">{journalPosts[0].excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <p className="label-sm text-[#bfc5cc]/40">{journalPosts[0].publishDate}</p>
                  <ArrowUpRight size={16} className="text-[#ff5a00]" />
                </div>
              </div>
            </div>
          </Link>

          {/* Remaining posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journalPosts.slice(1).map((post, i) => (
              <Link
                key={post.id}
                to={`/journal/${post.slug}`}
                className="block no-underline border border-white/5 overflow-hidden group reveal"
                onMouseEnter={() => setCursorMode("view")}
                onMouseLeave={() => setCursorMode("default")}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="aspect-[16/9] overflow-hidden bg-[#14171b]">
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="badge badge-gray">{post.category}</span>
                    <div className="flex items-center gap-1 label-sm text-[#bfc5cc]/40">
                      <Clock size={10} /> {post.readTime} min
                    </div>
                  </div>
                  <h3 className="text-lg font-700 text-[#f5f7f8] mb-2 group-hover:text-[#ff5a00] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                    {post.title}
                  </h3>
                  <p className="text-[#bfc5cc] text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <p className="label-sm text-[#bfc5cc]/40">{post.publishDate}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
