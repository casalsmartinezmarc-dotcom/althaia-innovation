/**
 * Icones pròpies (línia, currentColor) que substitueixen els emojis de l'app.
 * Mateix llenguatge visual que lucide-react (stroke 1.8, cantonades rodones)
 * perquè conviuen sense desentonar, però dibuixades expressament per a
 * cada concepte de la metodologia SISCU.
 */
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const svg = (size, className, children) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>{children}</svg>
)

// ─── Fases del pipeline ────────────────────────────────────────────────────────

export function IconSearch({ size = 18, className }) {
  return svg(size, className, <>
    <circle cx="10" cy="10" r="6.2" />
    <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
    <line x1="14.6" y1="14.6" x2="20" y2="20" />
  </>)
}

export function IconBulb({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M9 18.5h6M10 21h4" />
    <path d="M12 3.2a5.8 5.8 0 0 0-3.4 10.5c.5.4.8 1 .8 1.6v.7h5.2v-.7c0-.6.3-1.2.8-1.6A5.8 5.8 0 0 0 12 3.2Z" />
    <line x1="12" y1="6.6" x2="12" y2="6.6" />
  </>)
}

export function IconTarget({ size = 18, className }) {
  return svg(size, className, <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.3" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
  </>)
}

export function IconDraft({ size = 18, className }) {
  return svg(size, className, <>
    <rect x="3" y="16.2" width="14" height="3.6" rx="0.8" />
    <line x1="6.5" y1="16.2" x2="6.5" y2="19.8" />
    <line x1="10" y1="16.2" x2="10" y2="19.8" />
    <line x1="13.5" y1="16.2" x2="13.5" y2="19.8" />
    <path d="M13 10 19 4l2 2-6 6h-2Z" />
  </>)
}

export function IconFlask({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M9.4 2.5h5.2" />
    <path d="M10.3 2.5v6.6L5 17.6a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5.3-8.5V2.5" />
    <path d="M7.7 14.2h8.6" />
    <circle cx="10.3" cy="17" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="13.8" cy="18.4" r="0.5" fill="currentColor" stroke="none" />
  </>)
}

export function IconChartBars({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M3 21h18" />
    <rect x="6" y="13.5" width="3.2" height="7.5" />
    <rect x="10.4" y="9" width="3.2" height="12" />
    <rect x="14.8" y="4.5" width="3.2" height="16.5" />
  </>)
}

export function IconRocket({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M12 2.2c2.4 2 3.8 5.3 3.8 8.7 0 1.9-.4 3.5-1.1 4.9L12 19l-2.7-3.2C8.6 14.4 8.2 12.8 8.2 10.9c0-3.4 1.4-6.7 3.8-8.7Z" />
    <circle cx="12" cy="10.2" r="1.5" />
    <path d="M8.9 15 6.1 17.3l.9-3M15.1 15l2.8 2.3-.9-3" />
    <path d="M10.4 19 9.2 21.8M13.6 19l1.2 2.8" />
  </>)
}

export function IconTrendUp({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M3 17.5 8.3 12l3.6 3 8.1-8" />
    <path d="M16 7h4v4" />
  </>)
}

// ─── Timeline ──────────────────────────────────────────────────────────────────

export function IconFlagMark({ size = 16, className }) {
  return svg(size, className, <>
    <line x1="5" y1="3" x2="5" y2="21" />
    <path d="M5 4.2h13.5l-3.2 4 3.2 4H5" />
  </>)
}

export function IconCalendar({ size = 16, className }) {
  return svg(size, className, <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <circle cx="8.3" cy="14.3" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14.3" r="1" fill="currentColor" stroke="none" />
  </>)
}

export function IconPackage({ size = 16, className }) {
  return svg(size, className, <>
    <path d="M3 8 12 3l9 5-9 5-9-5Z" />
    <path d="M3 8v9l9 5 9-5V8" />
    <line x1="12" y1="13" x2="12" y2="22" />
  </>)
}

export function IconNote({ size = 16, className }) {
  return svg(size, className, <>
    <path d="M6 3h9l3 3v15H6Z" />
    <path d="M15 3v3h3" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="14" y2="16" />
  </>)
}

// ─── Criteris de validació SLL ──────────────────────────────────────────────────

export function IconShield({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M12 3.2 19 6v6c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6l7-2.8Z" />
    <path d="M9 12.2 11 14.2 15.3 9.9" />
  </>)
}

export function IconLink({ size = 18, className }) {
  return svg(size, className, <>
    <path d="M10 14 14 10" />
    <path d="M11.3 7.3l1.2-1.2a3.5 3.5 0 0 1 5 5l-1.2 1.2" />
    <path d="M12.7 16.7l-1.2 1.2a3.5 3.5 0 0 1-5-5l1.2-1.2" />
  </>)
}

export function IconPerson({ size = 18, className }) {
  return svg(size, className, <>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c0-4 3-6.3 7-6.3s7 2.3 7 6.3" />
  </>)
}

// ─── Impacte (formulari Nova Innovació) ────────────────────────────────────────

export function IconPulse({ size = 16, className }) {
  return svg(size, className, <>
    <path d="M12 20.3S3.5 15.4 2.4 9.7C1.7 6.4 4 3.5 7.1 3.2c2-.2 3.7.8 4.9 2.5 1.2-1.7 2.9-2.7 4.9-2.5 3.1.3 5.4 3.2 4.7 6.5-1.1 5.7-9.6 10.6-9.6 10.6Z" />
    <path d="M5.5 11h3l1.6-3.2 2 5.2 1.6-2h4.3" />
  </>)
}

export function IconCoin({ size = 16, className }) {
  return svg(size, className, <>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M15 8.6a4.3 4.3 0 1 0 0 6.8" />
    <line x1="6.6" y1="10.4" x2="13" y2="10.4" />
    <line x1="6.6" y1="13.4" x2="12.4" y2="13.4" />
  </>)
}

export function IconBuilding({ size = 16, className }) {
  return svg(size, className, <>
    <rect x="4" y="3" width="10" height="18" rx="0.6" />
    <rect x="14" y="9.5" width="6" height="11.5" rx="0.6" />
    <rect x="6.6" y="6.2" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="10.6" y="6.2" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="6.6" y="10.2" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="10.6" y="10.2" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="6.6" y="14.2" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="10.6" y="14.2" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="16.2" y="12.6" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    <rect x="16.2" y="16.4" width="1.8" height="1.8" fill="currentColor" stroke="none" />
  </>)
}

export function IconSmile({ size = 16, className }) {
  return svg(size, className, <>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M7.8 13.8c1 1.6 2.6 2.5 4.2 2.5s3.2-.9 4.2-2.5" />
    <line x1="8.8" y1="9.4" x2="8.8" y2="9.42" />
    <line x1="15.2" y1="9.4" x2="15.2" y2="9.42" />
  </>)
}
