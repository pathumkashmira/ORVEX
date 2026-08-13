import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const navLinks = [
  { label: "Work", to: "/work" },
  { label: "Services", to: "/services" },
  { label: "Studio", to: "/studio" },
  { label: "Process", to: "/process" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useApp();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const bg = scrolled ? "bg-[#050608]/95 backdrop-blur-sm border-b border-white/5" : "bg-transparent";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[800] transition-all duration-500 ${bg}`}>
        <div className="flex items-center justify-between px-8 md:px-12 h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 flex-shrink-0">
                <div className="absolute inset-0 border border-[#ff5a00]/60 rounded-full" style={{ transform: "rotateX(60deg)", animation: "orbit-tilt 4s linear infinite" }} />
                <div className="absolute inset-[6px] bg-[#ff5a00] rounded-full" />
              </div>
              <span className="font-display font-700 text-[18px] tracking-[0.15em] text-[#f5f7f8] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                ORVEX
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <Link
                to={user.role === "admin" ? "/admin" : "/client"}
                className="nav-link"
              >
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
            <Link to="/book" className="btn-primary text-xs py-3 px-6">
              BOOK A CALL
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-[#f5f7f8] bg-transparent border-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <div className="absolute top-0 left-0 right-0 h-[72px] flex items-center px-8 justify-between">
          <span className="font-display font-700 text-[18px] tracking-[0.15em] text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>ORVEX</span>
          <button className="text-[#f5f7f8] bg-transparent border-none" onClick={() => setMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="no-underline"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="py-4 border-b border-white/5 flex items-center justify-between group">
                <span className="font-display text-[32px] font-600 text-[#f5f7f8] tracking-[-0.01em] group-hover:text-[#ff5a00] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {link.label}
                </span>
                <span className="label-sm text-[#bfc5cc]">0{i + 1}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <Link to="/book" className="btn-primary justify-center">BOOK A CALL</Link>
          {user ? (
            <Link to={user.role === "admin" ? "/admin" : "/client"} className="btn-secondary justify-center">DASHBOARD</Link>
          ) : (
            <Link to="/login" className="btn-secondary justify-center">LOGIN</Link>
          )}
        </div>
        <div className="mt-auto pt-8">
          <p className="label-sm text-[#bfc5cc]/60">hello@orvex.studio</p>
        </div>
      </div>
    </>
  );
}
