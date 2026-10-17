const PATHS: Record<string, string> = {
  explore: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  buy: "M11 4a7 7 0 100 14 7 7 0 000-14zm9 16l-4-4",
  sell: "M12 5v14M5 12h14",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  smartphone: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zm4 15h.01",
  cpu: "M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4",
  shirt: "M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 01-8 0z",
  sofa: "M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3M3 11a2 2 0 012 2v2h14v-2a2 2 0 012-2M6 15v3M18 15v3",
  car: "M5 16l1.5-5a2 2 0 011.9-1.4h7.2a2 2 0 011.9 1.4L19 16M4 16h16v3H4zM7 19v1M17 19v1",
  gem: "M6 3h12l4 6-10 12L2 9zM2 9h20M12 3l-3 6 3 12 3-12-3-6",
  watch: "M9 3h6l1 4H8zM9 21h6l1-4H8zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2v3l2 1",
  gamepad: "M6 8h12a4 4 0 014 4v2a3 3 0 01-5.2 2L15 14H9l-1.8 2A3 3 0 012 14v-2a4 4 0 014-4zM8 10v3M6.5 11.5h3M16 11h.01M18 13h.01",
  dumbbell: "M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12",
  tag: "M3 12V4h8l10 10-8 8zM7.5 8h.01",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v5l3 2",
  heart: "M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  wallet: "M3 7a2 2 0 012-2h13v4M3 7v10a2 2 0 002 2h15V9H5a2 2 0 01-2-2zm14 6h.01",
  gavel: "M14 4l6 6-3 3-6-6zM11 7L4 14l3 3 7-7M3 21h9",
};

export default function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.tag} />
    </svg>
  );
}
