import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, ArrowUpRight } from "lucide-react";
import Layout from "@/components/Layout";
import { journalPosts } from "@/data/seed";
import { useApp } from "@/contexts/AppContext";

const ARTICLE_BODIES: Record<string, { sections: { heading?: string; body: string }[] }> = {
  "inside-orbital-motion-study": {
    sections: [
      {
        body: "Every project at ORVEX begins with a question. For ORBITAL, the question was simple and impossible: what does gravity look like? Not the metaphor of gravity — the actual invisible architecture of gravitational fields that holds moons in orbit, bends light around mass, and creates the elliptical paths that satellites trace in silence above us.",
      },
      {
        heading: "Starting with the data",
        body: "We pulled real telemetry data from three publicly archived satellite missions: a polar orbit, a geostationary position, and a highly elliptical transfer orbit. These three trajectories became the structural skeleton of the piece. Every ring you see in ORBITAL corresponds to a real orbital band — not a design decision, but a translation.",
      },
      {
        body: "The initial simulations ran in Houdini using a simplified two-body problem solver. This gave us the correct eccentricities and period ratios, but the resulting geometry was mathematically precise and visually inert. Science rarely looks like what it is.",
      },
      {
        heading: "Rebuilding for the eye",
        body: "We rebuilt every element in Blender, using the Houdini output as reference rather than source geometry. This is a critical distinction in CGI work: the simulation tells you where things are, the render tells you what they mean. For ORBITAL, 'meaning' required us to compress the scale relationships dramatically — true orbital distances at visual scale would produce a black screen with three invisible dots.",
      },
      {
        body: "Lighting became the central creative challenge. In actual space, there are no ambient fills, no bounce cards, no key-to-rim ratio to dial in. Everything is harsh directional sunlight or complete shadow. We shot a single directional source and built the entire depth structure from reflectivity alone. The rings are not emissive — they catch and scatter light. That distinction is everything.",
      },
      {
        heading: "The traveling sphere",
        body: "The traveling sphere on the innermost ring was one of the last elements added, and the one that changed the piece most significantly. Before it existed, ORBITAL read as decorative — elegant, but inert. The sphere introduced a locus of attention that moved through the frame over time. Suddenly you were watching something happen, not just looking at something beautiful.",
      },
      {
        body: "The sphere's material is a custom PBR setup: polished ceramic white with a subsurface scatter approximating a cool internal light source. It has no actual emission, but reads as luminous against the deep background. This is a common CGI trick — objects that glow without glowing — and it took twelve test renders to get the balance right.",
      },
      {
        heading: "Render pipeline and timing",
        body: "ORBITAL was rendered entirely in Cycles at 4096 samples per frame on a farm of 6 machines over 11 days. Each frame at 4K takes approximately 4 minutes. The full 90-second sequence at 24fps required 2,160 renders. We ran motion blur at 0.5 shutter, which softened the sphere's leading edge in a way that implied speed without obscuring the form.",
      },
      {
        body: "The sound design was handled by a collaborator we work with regularly. The brief was: orbital mechanics with no instruments. The final track uses field recordings from the inside of an MRI machine, time-stretched and pitch-shifted. It sounds exactly like what it looks like.",
      },
    ],
  },
  "material-design-titanium-shader": {
    sections: [
      {
        body: "When AXIOM gave us technical specs instead of physical samples, we knew we were in for a difficult material build. Brushed titanium is one of the most demanding surfaces in product CGI — it has directionality, subtle anisotropy, a specific reflectance characteristic that changes with angle, and a blue-grey tint that shifts from cool to warm depending on the light source color temperature.",
      },
      {
        heading: "Week one: the reference hunt",
        body: "Before opening Blender, we spent three days gathering reference. Not just photos of titanium — photos of machined titanium, anodized titanium, aerospace-grade titanium, brushed versus polished, flat versus curved. The goal was to understand the material not as a monolith but as a family of behaviors. The brushing direction matters enormously: parallel to the camera plane, brushing creates a soft satin sheen. Perpendicular to it, you get sharp specular streaks.",
      },
      {
        body: "We also pulled microscopy images of actual brushed metal surfaces at 50x and 200x magnification. At those scales, brushing is not a smooth texture — it's a series of parallel gouges with irregular depth and spacing. This level of surface detail rarely renders as crisp individual scratches; instead it creates the characteristic anisotropic highlight that reads as 'brushed metal' to the human eye.",
      },
      {
        heading: "The shader architecture",
        body: "Our base shader is built from three layers. The first is a Principled BSDF configured for metallic behavior: metallic at 1.0, roughness at 0.18 (a carefully measured value from our reference material comparisons), and specular tint set to bring in the titanium's characteristic blue-grey shift. The second layer is a tangent-space anisotropy pass using a custom directional texture that drives the highlight elongation. The third is a subtle clearcoat representing the thin oxide layer that forms on titanium surfaces and gives them their distinct reflective quality.",
      },
      {
        body: "The anisotropy texture was the most labor-intensive element. We generated a custom displacement map from a pattern-generating script, then adjusted it iteratively based on how the highlights behaved in test renders. Too much anisotropy and it looks like a CD. Too little and it looks like steel. The correct value for AXIOM's surface was 0.62 on the anisotropy slider, at a rotation of 90 degrees to the UV direction.",
      },
      {
        heading: "Weeks two and three: iteration",
        body: "The first two weeks produced fourteen rejected iterations. Each had something wrong: too silver, too warm, too blue, highlights too sharp, highlights too soft, metallic value creating unexpected darkening at grazing angles. The breakthrough came on day 16 when we separated the base color from the metallic response and introduced a subtle texture-driven color variation — real machined metals are not perfectly uniform in color.",
      },
      {
        body: "Final validation was done by printing reference renders at A3 size and comparing them side-by-side with photos taken of actual machined aluminum watch cases (the closest physical reference we could source in the studio). The day our print looked indistinguishable from the photograph at arm's length, the shader was done.",
      },
    ],
  },
  "cgi-vs-photography-2026": {
    sections: [
      {
        body: "The question comes up in every client brief: should this be photography or CGI? In 2026, the gap between the two has narrowed dramatically in both directions — CGI has become cheaper and faster, while photography has become more expensive and logistically demanding. But the calculus is not about cost alone, and the wrong choice for the wrong brief can be visually obvious in the worst way.",
      },
      {
        heading: "Where photography still wins",
        body: "Photography's core advantage has never been realism — it's credibility. There is a quality of documentary truth in a photograph that CGI still cannot fully replicate, particularly in contexts where the viewer is being asked to make an emotional connection rather than just an aesthetic judgment. Fashion, human portraiture, lifestyle imagery, anything where a real person's presence carries meaning: photography wins by default.",
      },
      {
        body: "Photography also wins when the production scale would make CGI prohibitively expensive. A complex outdoor scene with dozens of unique elements, organic textures, and unpredictable light is faster and cheaper to shoot than to model, texture, light, and render. The crossover point depends on the project, but as a rough heuristic: when you can control the physical environment more cheaply than you can build a virtual one, shoot.",
      },
      {
        heading: "Where CGI wins",
        body: "CGI's fundamental advantage is iteration without marginal cost. Once your product is modeled and textured, generating a new colorway costs hours, not thousands of dollars. Changing the environment, the lighting, the angle — all of these are non-destructive edits in a CGI pipeline. For products that launch in multiple variants, CGI pays for itself on the second colorway.",
      },
      {
        body: "CGI also wins when physical access is impossible or impractical. You cannot photograph an unreleased product that doesn't exist yet. You cannot photograph a building that isn't built. You cannot photograph a molecule or a satellite. These are the obvious cases. Less obvious: you often cannot photograph an existing product at the quality level required for a hero campaign image without production costs that exceed what CGI would cost.",
      },
      {
        heading: "The hybrid approach",
        body: "In practice, the most effective campaigns in 2026 combine both. A car sits on a CGI environment plate — the reflections, the shadows, the depth — but the car itself was shot in a controlled studio. A product sits on a surface that was photographed but composited with CGI lighting. A building is photographed but the sky, trees, and landscaping are fully rendered. The line between the two disciplines has dissolved at the production level even as clients still think of them as distinct choices.",
      },
      {
        body: "Our recommendation to any client is this: start with the outcome, not the medium. What does the image need to do? Who will see it, and where? What is the acceptable cost range? What do you need to change after delivery? The answers to those questions will tell you which discipline — or which combination — is correct for your project.",
      },
    ],
  },
};

export default function JournalPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setCursorMode } = useApp();

  const post = journalPosts.find((p) => p.slug === slug);
  const related = journalPosts.filter((p) => p.slug !== slug).slice(0, 2);
  const body = slug ? ARTICLE_BODIES[slug] : null;

  useEffect(() => {
    if (!post) navigate("/journal", { replace: true });
  }, [post, navigate]);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (e) => { e.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); }); },
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [post]);

  if (!post) return null;

  return (
    <Layout>
      {/* Back */}
      <div className="pt-28 pb-0 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <Link to="/journal" className="inline-flex items-center gap-2 label-sm text-[#bfc5cc]/50 hover:text-[#ff5a00] transition-colors no-underline mb-10">
            <ArrowLeft size={12} /> JOURNAL
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 md:px-12 pb-0">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-[780px] mb-10 reveal">
            <div className="flex items-center gap-4 mb-6">
              <span className="badge badge-orange">{post.category}</span>
              <div className="flex items-center gap-1 label-sm text-[#bfc5cc]/40">
                <Clock size={10} /> {post.readTime} min read
              </div>
              <span className="label-sm text-[#bfc5cc]/40">{post.publishDate}</span>
            </div>
            <h1
              className="text-[clamp(36px,5vw,72px)] font-700 tracking-[-0.03em] text-[#f5f7f8] leading-[1.05] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
            >
              {post.title}
            </h1>
            <p className="text-[#bfc5cc] text-lg leading-relaxed">{post.excerpt}</p>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <div className="px-8 md:px-12 mb-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="aspect-[21/9] overflow-hidden bg-[#14171b] reveal">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Article body */}
      <section className="px-8 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-16">
            {/* Content */}
            <div className="max-w-[680px]">
              {body ? (
                body.sections.map((section, i) => (
                  <div key={i} className="mb-8 reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                    {section.heading && (
                      <h2
                        className="text-xl font-700 text-[#f5f7f8] mb-4 mt-10"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                      >
                        {section.heading}
                      </h2>
                    )}
                    <p className="text-[#bfc5cc] leading-[1.75] text-[15px]">{section.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-[#bfc5cc] leading-[1.75]">{post.content}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-16 pt-10 border-t border-white/5">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge badge-gray">#{tag}</span>
                ))}
              </div>

              {/* Author */}
              <div className="mt-10 flex items-center gap-4 p-6 border border-white/5 bg-[#14171b]/40">
                <div className="w-10 h-10 bg-[#ff5a00] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-700 text-[#050608]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>OX</span>
                </div>
                <div>
                  <p className="font-700 text-[#f5f7f8] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{post.author}</p>
                  <p className="text-[#bfc5cc]/50 text-xs mt-0.5">3D Design &amp; CGI Studio</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:block">
              <div className="sticky top-28">
                <div className="border-t border-white/5 pt-6 mb-10">
                  <p className="label-sm mb-4">ARTICLE DETAILS</p>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="label-sm text-[#bfc5cc]/40">Category</p>
                      <p className="text-[#f5f7f8] text-xs text-right">{post.category}</p>
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="label-sm text-[#bfc5cc]/40">Published</p>
                      <p className="text-[#f5f7f8] text-xs text-right">{post.publishDate}</p>
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="label-sm text-[#bfc5cc]/40">Read time</p>
                      <p className="text-[#f5f7f8] text-xs">{post.readTime} min</p>
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="label-sm text-[#bfc5cc]/40">Author</p>
                      <p className="text-[#f5f7f8] text-xs">{post.author}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="label-sm mb-4">ALSO IN JOURNAL</p>
                  <div className="space-y-4">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/journal/${rel.slug}`}
                        className="block no-underline group"
                        onMouseEnter={() => setCursorMode("enter")}
                        onMouseLeave={() => setCursorMode("default")}
                      >
                        <div className="aspect-video overflow-hidden bg-[#14171b] mb-3">
                          <img
                            src={rel.coverImage}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-[#f5f7f8] text-xs font-700 leading-snug group-hover:text-[#ff5a00] transition-colors" style={{ fontWeight: 700 }}>
                          {rel.title}
                        </p>
                        <p className="label-sm text-[#bfc5cc]/40 mt-1">{rel.publishDate}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related posts — mobile */}
      <section className="md:hidden px-8 py-16 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-sm mb-8">MORE FROM THE JOURNAL</p>
          <div className="grid grid-cols-1 gap-6">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/journal/${rel.slug}`}
                className="block no-underline border border-white/5 overflow-hidden group"
              >
                <div className="aspect-video overflow-hidden bg-[#14171b]">
                  <img src={rel.coverImage} alt={rel.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-5">
                  <p className="text-[#f5f7f8] text-sm font-700 group-hover:text-[#ff5a00] transition-colors" style={{ fontWeight: 700 }}>{rel.title}</p>
                  <p className="label-sm text-[#bfc5cc]/40 mt-2">{rel.publishDate}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 md:px-12 py-24 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="label-orange mb-3">WORK WITH US</p>
            <h2 className="text-3xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              READY TO START A PROJECT?
            </h2>
          </div>
          <div className="flex gap-4">
            <Link
              to="/contact"
              className="btn-primary"
              onMouseEnter={() => setCursorMode("enter")}
              onMouseLeave={() => setCursorMode("default")}
            >
              GET IN TOUCH <ArrowUpRight size={14} />
            </Link>
            <Link to="/journal" className="btn-secondary">
              MORE ARTICLES
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
