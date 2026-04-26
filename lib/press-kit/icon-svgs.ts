/**
 * Static SVG payloads for each icon in the family. Mirrors components/icons/
 * but emitted as raw SVG strings so the download API can ship them without
 * server-rendering React components (Next.js App Router disallows
 * react-dom/server in route handlers).
 *
 * Keep these in lockstep with the React icon components. If you change
 * geometry in a component, also update the corresponding string here.
 */

const HEAD = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 64 64" fill="none" stroke="#0B0D0E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`;
const HEAD_MONO = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="384" height="192" viewBox="0 0 48 24" fill="none" stroke="#0B0D0E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`;
const FOOT = `</svg>`;

const HOT = ` fill="#3E8B87" stroke="#3E8B87"`;

export const ICON_SVGS: Record<string, string> = {
  "NH-Monogram": `${HEAD_MONO}
    <line x1="3" y1="4" x2="3" y2="20"/>
    <line x1="3" y1="4" x2="15" y2="20"/>
    <line x1="15" y1="4" x2="15" y2="20"/>
    <line x1="24" y1="4" x2="24" y2="20"/>
    <line x1="36" y1="4" x2="36" y2="20"/>
    <line x1="24" y1="12" x2="40" y2="12"/>
    <path d="M40 12 L43 10 L43 14 Z"${HOT}/>
    <circle cx="19.5" cy="12" r="1.25"${HOT}/>
  ${FOOT}`,

  "GapIcon": `${HEAD}
    <path d="M6 18 L18 18 L18 28 L34 28 L34 22 L48 22 L48 32"/>
    <circle cx="18" cy="18" r="1.75" fill="currentColor"/>
    <circle cx="34" cy="28" r="1.75" fill="currentColor"/>
    <circle cx="48" cy="22" r="1.75" fill="currentColor"/>
    <path d="M6 46 C 14 42, 18 50, 26 46 S 38 42, 44 46 L 48 42" stroke-width="1.25"/>
    <path d="M48 32 L56 32"/>
    <circle cx="56" cy="32" r="3.5"${HOT}/>
    <circle cx="56" cy="32" r="6" stroke-width="1" opacity="0.5"/>
  ${FOOT}`,

  "FluencyIcon": `${HEAD}
    <circle cx="32" cy="32" r="3.5"${HOT}/>
    <circle cx="32" cy="32" r="7" stroke-width="1" opacity="0.6"/>
    <line x1="8" y1="18" x2="22" y2="18"/><line x1="22" y1="18" x2="25" y2="28"/>
    <line x1="8" y1="32" x2="25" y2="32"/>
    <line x1="8" y1="46" x2="22" y2="46"/><line x1="22" y1="46" x2="25" y2="36"/>
    <circle cx="8" cy="18" r="1.5"/><circle cx="8" cy="32" r="1.5"/><circle cx="8" cy="46" r="1.5"/>
    <line x1="39" y1="28" x2="42" y2="18"/><line x1="42" y1="18" x2="56" y2="18"/>
    <line x1="39" y1="32" x2="56" y2="32"/>
    <circle cx="56" cy="18" r="1.5" fill="currentColor"/><circle cx="56" cy="32" r="1.5" fill="currentColor"/>
  ${FOOT}`,

  "TimelineIcon": `${HEAD}
    <line x1="20" y1="6" x2="20" y2="58"/>
    <circle cx="20" cy="12" r="3.5" fill="none" stroke-width="1.5"/>
    <line x1="24" y1="12" x2="42" y2="12" stroke-width="1"/>
    <circle cx="20" cy="24" r="2.5" fill="currentColor"/><line x1="24" y1="24" x2="50" y2="24" stroke-width="1"/>
    <circle cx="20" cy="36" r="2.5" fill="currentColor"/><line x1="24" y1="36" x2="36" y2="36" stroke-width="1"/>
    <circle cx="20" cy="46" r="2.5" fill="currentColor"/><line x1="24" y1="46" x2="44" y2="46" stroke-width="1"/>
    <circle cx="20" cy="55" r="1.75" fill="currentColor"/>
    <circle cx="42" cy="12" r="1.5"${HOT}/>
  ${FOOT}`,

  "EngageSplitIcon": `${HEAD}
    <circle cx="8" cy="32" r="2" fill="currentColor"/><line x1="10" y1="32" x2="20" y2="32"/>
    <circle cx="20" cy="32" r="2"${HOT}/>
    <path d="M20 32 L28 18 L44 18"/><circle cx="50" cy="18" r="5"/>
    <line x1="22" y1="32" x2="50" y2="32"/><path d="M50 28 L54 32 L50 36 Z" fill="currentColor"/>
    <path d="M20 32 L28 46 L40 46"/><path d="M42 46 A 4 4 0 0 1 50 46" stroke-width="1.25"/>
  ${FOOT}`,

  "ContactIcon": `${HEAD}
    <rect x="8" y="18" width="44" height="30" stroke-width="1.5"/>
    <path d="M8 18 L30 36 L52 18"/><circle cx="30" cy="36" r="2" fill="currentColor"/>
    <line x1="52" y1="18" x2="58" y2="12" stroke-width="1"/><circle cx="58" cy="12" r="2"${HOT}/>
  ${FOOT}`,

  "WritingIcon": `${HEAD}
    <path d="M32 8 L20 44 L44 44 Z"/>
    <line x1="32" y1="16" x2="32" y2="38" stroke-width="1"/>
    <circle cx="32" cy="44" r="2.25"${HOT}/>
    <path d="M32 46 C 22 50, 14 52, 10 58" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>
    <path d="M32 46 C 32 52, 32 56, 32 60" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>
    <path d="M32 46 C 42 50, 50 52, 54 58" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>
  ${FOOT}`,

  "OtherTeacherIcon": `${HEAD}
    <line x1="6" y1="22" x2="52" y2="22"/>
    <line x1="6" y1="42" x2="52" y2="42" stroke-dasharray="3 4" opacity="0.7"/>
    <circle cx="50" cy="22" r="2.5"${HOT}/>
    <line x1="56" y1="10" x2="56" y2="54"/><path d="M56 10 L62 13 L56 16 Z" fill="currentColor" stroke="none"/>
  ${FOOT}`,

  "LessonPlanIcon": `${HEAD}
    <circle cx="8" cy="32" r="2" fill="currentColor"/><line x1="10" y1="32" x2="22" y2="32"/>
    <circle cx="22" cy="32" r="2"/>
    <path d="M22 32 L22 18 L32 18"/><line x1="22" y1="32" x2="32" y2="32"/><path d="M22 32 L22 46 L32 46"/>
    <line x1="32" y1="18" x2="56" y2="18" stroke-width="1"/>
    <line x1="32" y1="32" x2="56" y2="32" stroke-width="1"/>
    <line x1="32" y1="46" x2="56" y2="46" stroke-width="1"/>
    <circle cx="46" cy="18" r="2.5"${HOT}/>
  ${FOOT}`,

  "CurriculumAuditIcon": `${HEAD}
    <g opacity="0.35" stroke-width="1">
      <line x1="6" y1="16" x2="58" y2="16"/><line x1="6" y1="32" x2="58" y2="32"/><line x1="6" y1="48" x2="58" y2="48"/>
      <line x1="23" y1="8" x2="23" y2="56"/><line x1="41" y1="8" x2="41" y2="56"/>
    </g>
    <path d="M10 12 L19 12 L19 18 L14.5 22 L10 18 Z" stroke-width="1.25"/>
    <path d="M10 36 L19 36 L19 42 L14.5 46 L10 42 Z" stroke-width="1.25"/>
    <line x1="26" y1="20" x2="30" y2="20" stroke-width="1.25"/>
    <line x1="34" y1="20" x2="38" y2="20" stroke-width="1.25" stroke-dasharray="2 2" opacity="0.6"/>
    <circle cx="50" cy="20" r="2"${HOT}/>
    <circle cx="50" cy="20" r="5" stroke-width="1.25" opacity="0.7"/>
    <circle cx="50" cy="20" r="8" stroke-width="1.25" opacity="0.35"/>
  ${FOOT}`,

  "PrincipalsInboxIcon": `${HEAD}
    <rect x="14" y="36" width="40" height="16" stroke-width="1.25" opacity="0.45"/>
    <rect x="10" y="26" width="40" height="16" stroke-width="1.25" opacity="0.7"/>
    <rect x="6" y="14" width="44" height="20" stroke-width="1.5" fill="white"/>
    <circle cx="16" cy="24" r="2"/>
    <circle cx="28" cy="24" r="2.75"${HOT}/>
    <circle cx="28" cy="24" r="5.5" stroke-width="1" opacity="0.5"/>
    <path d="M37 22 L43 24 L37 26 Z" fill="currentColor"/>
  ${FOOT}`,

  "TalkExplorerIcon": `${HEAD}
    <path d="M12 14 L24 24 L32 38 L48 46" stroke-width="1.5"/>
    <path d="M24 24 L40 12 L52 22" stroke-width="1" stroke-dasharray="2 3" opacity="0.55"/>
    <path d="M32 38 L16 50" stroke-width="1" stroke-dasharray="2 3" opacity="0.55"/>
    <circle cx="12" cy="14" r="1.75"/><circle cx="24" cy="24" r="1.75"/>
    <circle cx="40" cy="12" r="1.75"/><circle cx="52" cy="22" r="1.75"/>
    <circle cx="32" cy="38" r="2.75"${HOT}/>
    <circle cx="32" cy="38" r="6" stroke-width="1" opacity="0.45"/>
    <circle cx="48" cy="46" r="1.75"/><circle cx="16" cy="50" r="1.75"/>
  ${FOOT}`,

  "AnchorTierIcon": `${HEAD}
    <path d="M32 6 L38 12 L32 18 L26 12 Z"/>
    <line x1="32" y1="18" x2="32" y2="48"/>
    <line x1="14" y1="24" x2="50" y2="24"/>
    <circle cx="14" cy="24" r="1.75" fill="currentColor"/><circle cx="50" cy="24" r="1.75" fill="currentColor"/>
    <path d="M32 48 C 26 54, 18 52, 14 44"/><path d="M32 48 C 38 54, 46 52, 50 44"/>
    <circle cx="32" cy="48" r="2.25"${HOT}/>
  ${FOOT}`,

  "SprintTierIcon": `${HEAD}
    <path d="M40 6 L22 30 L34 30 L20 56" stroke-width="2"/>
    <circle cx="22" cy="30" r="2" fill="currentColor"/><circle cx="34" cy="30" r="2" fill="currentColor"/>
    <circle cx="20" cy="56" r="2.5"${HOT}/>
    <path d="M44 6 L26 30 L38 30 L24 56" stroke-width="1" stroke-dasharray="2 3" opacity="0.45"/>
  ${FOOT}`,

  "KeynoteTierIcon": `${HEAD}
    <path d="M12 52 L12 44 L24 44 L24 38 L40 38 L40 44 L52 44 L52 52 Z"/>
    <line x1="32" y1="38" x2="32" y2="28"/>
    <rect x="28" y="20" width="8" height="10" rx="2" stroke-width="1.5"/>
    <path d="M20 18 A 16 16 0 0 1 44 18" stroke-width="1.25"/>
    <path d="M16 12 A 22 22 0 0 1 48 12" stroke-width="1" opacity="0.5" stroke-dasharray="3 3"/>
    <circle cx="32" cy="25" r="1.75"${HOT}/>
  ${FOOT}`,

  "AIProofIcon": `${HEAD}
    <path d="M32 6 L52 14 L52 32 C 52 44, 42 52, 32 56 C 22 52, 12 44, 12 32 L12 14 Z"/>
    <line x1="24" y1="20" x2="24" y2="40" stroke-width="1.5"/>
    <line x1="40" y1="20" x2="40" y2="40" stroke-width="1.5"/>
    <line x1="24" y1="30" x2="40" y2="30" stroke-width="1.5"/>
    <circle cx="32" cy="30" r="2.25"${HOT}/>
  ${FOOT}`,

  "AIVulnerableIcon": `${HEAD}
    <line x1="6" y1="32" x2="24" y2="32"/><circle cx="6" cy="32" r="1.5" fill="currentColor"/>
    <circle cx="24" cy="32" r="2.5" stroke-width="1.5"/>
    <line x1="40" y1="32" x2="58" y2="32"/><circle cx="40" cy="32" r="2.5" stroke-width="1.5"/>
    <circle cx="58" cy="32" r="1.5" fill="currentColor"/>
    <line x1="26" y1="32" x2="38" y2="32" stroke-dasharray="2 3" opacity="0.4"/>
    <circle cx="32" cy="14" r="2.5"${HOT}/>
  ${FOOT}`,

  "AIAmplifiedIcon": `${HEAD}
    <circle cx="32" cy="32" r="3"${HOT}/>
    <circle cx="32" cy="32" r="8" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="16" stroke-width="1.25" opacity="0.7"/>
    <circle cx="32" cy="32" r="24" stroke-width="1" opacity="0.45" stroke-dasharray="3 3"/>
  ${FOOT}`,

  "FluencyGapIcon": `${HEAD}
    <circle cx="10" cy="20" r="1.75" fill="currentColor" opacity="0.7"/>
    <circle cx="20" cy="32" r="1.75" fill="currentColor" opacity="0.7"/>
    <circle cx="10" cy="44" r="1.75" fill="currentColor" opacity="0.7"/>
    <line x1="10" y1="20" x2="20" y2="32" stroke-width="1" opacity="0.55"/>
    <line x1="10" y1="44" x2="20" y2="32" stroke-width="1" opacity="0.55"/>
    <circle cx="38" cy="16" r="1.5" fill="currentColor"/><circle cx="48" cy="16" r="1.5" fill="currentColor"/><circle cx="58" cy="16" r="1.5" fill="currentColor"/>
    <circle cx="38" cy="32" r="1.5" fill="currentColor"/><circle cx="48" cy="32" r="2.5"${HOT}/><circle cx="58" cy="32" r="1.5" fill="currentColor"/>
    <circle cx="38" cy="48" r="1.5" fill="currentColor"/><circle cx="48" cy="48" r="1.5" fill="currentColor"/><circle cx="58" cy="48" r="1.5" fill="currentColor"/>
    <line x1="38" y1="16" x2="58" y2="16" stroke-width="1"/><line x1="38" y1="32" x2="58" y2="32" stroke-width="1"/><line x1="38" y1="48" x2="58" y2="48" stroke-width="1"/>
    <line x1="38" y1="16" x2="38" y2="48" stroke-width="1"/><line x1="48" y1="16" x2="48" y2="48" stroke-width="1"/><line x1="58" y1="16" x2="58" y2="48" stroke-width="1"/>
    <line x1="30" y1="6" x2="34" y2="58" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.55"/>
  ${FOOT}`,

  "DeskIcon": `${HEAD}
    <line x1="6" y1="46" x2="58" y2="46" stroke-width="1.5"/>
    <line x1="14" y1="46" x2="14" y2="56" stroke-width="1"/>
    <line x1="50" y1="46" x2="50" y2="56" stroke-width="1"/>
    <path d="M20 14 L42 14 C 44 14, 46 16, 46 18 L46 42 L20 42 Z" stroke-width="1.5"/>
    <path d="M42 14 L46 18" stroke-width="1"/>
    <circle cx="52" cy="20" r="2.5"${HOT}/>
  ${FOOT}`,
};

export function getIconSvg(name: string): string | null {
  return ICON_SVGS[name] ?? null;
}
