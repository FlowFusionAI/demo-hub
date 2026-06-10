export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        <span>© {new Date().getFullYear()} Saurav KC · Flow Fusion AI</span>
        <span>
          built with Next.js · this site is itself on the floor
        </span>
      </div>
    </footer>
  );
}
