import { useEffect, useState } from "react";

export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handle = () => setY(window.scrollY);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return y;
}
