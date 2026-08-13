import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const footerLinks = {
  Studio: [
    { label: "Work", to: "/work" },
    { label: "Services", to: "/services" },
    { label: "Studio", to: "/studio" },
    { label: "Process", to: "/process" },
    { label: "Experiments", to: "/experiments" },
  ],
  Connect: [
    { label: "Contact", to: "/contact" },
    { label: "Journal", to: "/journal" },
    { label: "Book a Call", to: "/book" },
    { label: "FAQ", to: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Refund Policy", to: "/refund" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="bg-[#050608] border-t border-white/5 pt-20 pb-8">
      <div className="px-8 md:px-12 max-w-[1400px] mx-auto">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-16 mb-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" className="no-underline block mb-4">
              <span className="font-display text-[28px] font-700 tracking-[0.15em] text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>ORVEX</span>
            </Link>
            <p className="label-orange mb-6">FORM. MOTION. BEYOND.</p>
            <p className="text-[#bfc5cc] text-sm leading-relaxed mb-8">
              A 3D design and CGI studio creating dimensional visuals, digital worlds, and cinematic experiences.
            </p>
            {/* Social */}
            <div className="flex items-center gap-5">
              {[
                { icon: <span className="text-[10px]">IG</span>, label: "Instagram", href: "#" },
                { icon: <span className="text-[10px]">YT</span>, label: "YouTube", href: "#" },
                { icon: <span className="text-[10px]">LI</span>, label: "LinkedIn", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-[#bfc5cc] hover:border-[#ff5a00] hover:text-[#ff5a00] transition-colors no-underline"
                >
                  {s.icon}
                </a>
              ))}
              <a
                href="#"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-[#bfc5cc] hover:border-[#ff5a00] hover:text-[#ff5a00] transition-colors no-underline"
                aria-label="Behance"
              >
                <span className="text-[10px] font-700" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Be</span>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <p className="label-sm mb-2">Newsletter</p>
            <p className="text-[#bfc5cc] text-sm mb-6 leading-relaxed">
              Selected ORVEX work and studio experiments, delivered sparingly.
            </p>
            {subscribed ? (
              <div className="border border-[#ff5a00]/30 bg-[#ff5a00]/05 p-4">
                <p className="label-orange text-xs">YOU'RE IN. EXPECT THE UNEXPECTED.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="orvex-input flex-1 text-sm"
                  required
                />
                <button type="submit" className="bg-[#ff5a00] hover:bg-[#e05000] transition-colors px-4 flex items-center text-[#050608]">
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Nav links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-16">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="label-sm mb-6">{section}</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[#bfc5cc] text-sm hover:text-[#ff5a00] transition-colors no-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="label-sm text-[#bfc5cc]/40">© 2026 ORVEX. ALL RIGHTS RESERVED.</p>
          </div>
          <a href="mailto:hello@orvex.studio" className="text-[#bfc5cc]/60 text-sm hover:text-[#ff5a00] transition-colors no-underline">
            hello@orvex.studio
          </a>
        </div>
      </div>
    </footer>
  );
}
