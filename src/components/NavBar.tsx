import { Link } from "@tanstack/react-router";
import { MessageCircle, UploadCloud } from "lucide-react";

const NAV_ITEMS: { to: string; label: string; icon: typeof MessageCircle }[] = [
  { to: "/", label: "채팅", icon: MessageCircle },
  { to: "/upload", label: "규칙 업로드", icon: UploadCloud },
];

export function NavBar() {
  return (
    <nav
      className="
        flex shrink-0 border-t border-slate-200/70 bg-white
        md:flex-col md:border-t-0 md:border-r md:h-full md:w-56 md:py-8 md:px-4 md:gap-2
        md:items-stretch
      "
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className="
            flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium
            transition-all duration-200 active:scale-95
            md:flex-row md:flex-none md:justify-start md:gap-3 md:rounded-2xl md:px-4 md:py-3 md:text-sm
            text-ink-400 hover:text-ink-700 md:hover:bg-slate-50
          "
          activeProps={{
            className: "text-mint-600 md:bg-mint-50 md:text-mint-700",
          }}
        >
          {({ isActive }) => (
            <>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
