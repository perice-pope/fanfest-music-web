import Link from "next/link";

const icons = {
  spotify: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4zm.1-2.8C14 8.6 7.6 8.4 3.8 9.5a1.2 1.2 0 11-.7-2.3C7.6 5.9 14.7 6.1 19.1 8.7a1.2 1.2 0 01-1.2 2.2z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20 8.3a6.7 6.7 0 01-4-1.3v7.7a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 102 2.8V2h2.8A4.2 4.2 0 0020 6.1v2.2z"/></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18.9 3H22l-7.4 8.5L23 21h-6.8l-5.3-6.9L4.8 21H1.7l7.9-9L1 3h7l4.8 6.3L18.9 3zm-2.4 16h1.9L7.6 5H5.6l10.9 14z"/></svg>
  ),
};

const colors = {
  spotify: "group-hover:text-[#1DB954]",
  instagram: "group-hover:text-[#E1306C]",
  tiktok: "group-hover:text-text",
  x: "group-hover:text-text",
};

export default function SocialLinkButton({ platform, href, label }) {
  const icon = icons[platform] || null;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group card-hover flex items-center justify-between gap-3 px-4 py-3.5"
    >
      <div className="flex items-center gap-3">
        <span className={`h-10 w-10 rounded-xl bg-surface2 grid place-items-center text-muted ${colors[platform] || "group-hover:text-brand"} transition-colors`}>
          {icon}
        </span>
        <div>
          <div className="text-sm font-semibold capitalize">{label || platform}</div>
          <div className="text-xs text-muted">@fanfest</div>
        </div>
      </div>
      <span className="text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all">&rarr;</span>
    </Link>
  );
}
