export default function Footer() {
  return (
    <footer className="border-t border-border/70 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-display text-lg font-semibold">FansFest</div>
          <div className="text-sm text-muted mt-1">Where fans and artists connect.</div>
        </div>
        <div className="text-xs text-muted">© {new Date().getFullYear()} FansFest. All rights reserved.</div>
      </div>
    </footer>
  );
}
