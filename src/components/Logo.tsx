import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export function Logo({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const target = user ? (user.role === "creator" ? "/studio" : "/app") : "/";

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      to={target}
      onClick={handleClick}
      className={`flex items-center gap-2 font-display font-bold text-xl ${className}`}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 12v0M8 8v8M12 5v14M16 9v6M20 12v0" />
        </svg>
        <span className="absolute inset-0 rounded-xl bg-gradient-primary opacity-50 blur-md -z-10" />
      </span>
      <span className="text-foreground">Pod<span className="text-gradient">ify</span></span>
    </Link>
  );
}
