import Link from "next/link";
import { Logo } from "./Logo";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8 shrink-0" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Saurav KC
            <span className="ml-2 font-mono text-[0.6rem] font-medium uppercase tracking-widest text-muted">
              the operations floor
            </span>
          </span>
        </Link>
        <a
          href="mailto:sauravkc456@gmail.com"
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          Get in touch →
        </a>
      </div>
    </nav>
  );
}
