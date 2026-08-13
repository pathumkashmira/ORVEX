import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import Cursor from "./Cursor";

interface Props {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter = false }: Props) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="noise min-h-screen bg-[#050608]">
      <Cursor />
      <Nav />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
