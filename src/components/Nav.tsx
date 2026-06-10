import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Saurav KC
          <span className="ml-2 font-mono text-[0.6rem] font-medium uppercase tracking-widest text-muted">
            the operations floor
          </span>
        </Link>
        <a
          href="mailto:sauravkc@flowfusionai.com"
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          Get in touch →
        </a>
      </div>
    </nav>
  );
}
