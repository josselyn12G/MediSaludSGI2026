// Modern, consistent line icons (stroke-based) used across the app.
const paths = {
  shield: "M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z",
  context: "M4 6h16M4 12h10M4 18h7",
  assets: "M3 7h18v12H3zM3 7l2-3h14l2 3M9 12h6",
  threats: "M12 3 2 21h20L12 3Zm0 6v5m0 3h.01",
  calc: "M7 3h10v18H7zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2",
  treat: "M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  monitor: "M3 4h18v12H3zM8 20h8M12 16v4M7 11l3-3 2 2 4-4",
  dashboard: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-4H3z",
  building: "M4 21V5l8-2 8 2v16M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6",
  heart: "M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21Z",
  lock: "M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5zM12 14v3",
  ai: "M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  users: "M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19a3 3 0 0 0-4-2.8M18 10a2.5 2.5 0 0 0 0-5",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6",
  logout: "M9 21H5V3h4M16 17l5-5-5-5M21 12H9",
  check: "M5 12l5 5L20 7",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6",
};

export default function Icon({ name, className = "h-6 w-6", strokeWidth = 1.8 }) {
  const d = paths[name] || paths.spark;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
