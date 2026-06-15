import type { ReactNode } from "react";
import { NavBar } from "./NavBar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen bg-bg-app flex flex-col md:flex-row">
      <main className="flex-1 min-h-0 flex flex-col md:order-2 max-w-2xl w-full mx-auto md:max-w-none">
        {children}
      </main>
      <div className="md:order-1 md:h-full">
        <NavBar />
      </div>
    </div>
  );
}
