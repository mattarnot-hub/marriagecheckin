// Digital twin of the Gottman "Sound Relationship House" (see "House for the App.jpeg").
// Each floor is a link to #floor/<id>. Dot = Gottman Checkup status; bar = this week's practice progress.
import { FLOORS } from './content.js';

const CX = 312;
const ROOMS = [
  { id: 'meaning', c: 1, hit: [140, 78, 344, 112], sep: [190, 150, 474],
    lines: [['Create', 128], ['Shared Meaning', 160]], bar: 174 },
  { id: 'dreams', c: 2, hit: [112, 190, 400, 72], sep: [262, 118, 506],
    lines: [['Make Life Dreams Come True', 236]], bar: 248, small: true },
  { id: 'conflict', c: 3, hit: [112, 262, 400, 148], sep: [410, 118, 506],
    lines: [['Manage Conflict', 300]], bar: 396,
    bullets: [['Accept Your Partner’s Influence', 328], ['Dialogue About Problems', 356], ['Practice Self-Soothing', 384]] },
  { id: 'positive', c: 4, hit: [112, 410, 400, 66], sep: [476, 118, 506], lines: [['The Positive Perspective', 446]], bar: 458 },
  { id: 'turn', c: 5, hit: [112, 476, 400, 68], sep: [544, 118, 506], lines: [['Turn Towards Instead of Away', 514]], bar: 526, small: true },
  { id: 'fondness', c: 6, hit: [112, 544, 400, 66], sep: [610, 118, 506], lines: [['Share Fondness and Admiration', 580]], bar: 592, small: true },
  { id: 'lovemaps', c: 7, hit: [112, 610, 400, 80], lines: [['Build Love Maps', 646]], bar: 682,
    bullets: [['Know One Another’s World', 672]] },
];

const status = (id) => FLOORS.find((f) => f.id === id).status;
const title = (id) => FLOORS.find((f) => f.id === id).title;

function room(r, prog) {
  const [hx, hy, hw, hh] = r.hit;
  const [done, total] = prog(r.id);
  const barY = r.bar, bw = 110, bx = CX - bw / 2;
  const fillW = total ? (bw * done) / total : 0;
  const size = r.small ? ' sm' : '';
  const text = r.lines.map(([t, y]) => `<text x="${CX}" y="${y}" text-anchor="middle" class="h c${r.c}${size}">${t}</text>`).join('');
  const bullets = (r.bullets || []).map(([t, y]) => `<circle class="bd" cx="${r.id === 'lovemaps' ? 214 : 228}" cy="${y - 6}" r="3.5"/><text class="b" x="${r.id === 'lovemaps' ? 226 : 242}" y="${y}">${t}</text>`).join('');
  const bar = total
    ? `<rect class="trk c${r.c}" x="${bx}" y="${barY}" width="${bw}" height="5" rx="2.5"/><rect class="c${r.c}" x="${bx}" y="${barY}" width="${fillW}" height="5" rx="2.5"/>`
    : '';
  const dot = `<circle class="dot s-${status(r.id)}" cx="${bx - 14}" cy="${barY + 2.5}" r="6.5"/>`;
  const sep = r.sep ? `<line class="sep c${r.c}" x1="${r.sep[1]}" x2="${r.sep[2]}" y1="${r.sep[0]}" y2="${r.sep[0]}"/>` : '';
  return `<a href="#floor/${r.id}" aria-label="${title(r.id)}: ${done} of ${total} practices this week"><rect class="hit" x="${hx}" y="${hy}" width="${hw}" height="${hh}"/>${text}${bullets}${bar}${dot}${sep}</a>`;
}

function pillar(id, side, word) {
  const left = side === 'L';
  const x0 = left ? 58 : 520, x1 = x0 + 46;
  const pts = left ? `${x0},262 ${x1},226 ${x1},684 ${x0},684` : `${x0},226 ${x1},262 ${x1},684 ${x0},684`;
  const cx = x0 + 23;
  const step = 38, start = 470 - ((word.length - 1) * step) / 2;
  const letters = [...word].map((ch, i) => `<text class="pt" x="${cx}" y="${start + i * step + 9}" text-anchor="middle">${ch}</text>`).join('');
  return `<a href="#floor/${id}" aria-label="${title(id)}"><polygon class="pil" points="${pts}"/>${letters}<circle class="pdot s-${status(id)}" cx="${cx}" cy="670" r="7"/></a>`;
}

export function houseSvg(prog) {
  return `<svg viewBox="0 0 624 712" role="group" aria-label="Sound Relationship House. Tap a floor to open it.">
  <path class="body" d="M312,58 L574,268 V692 H50 V268 Z"/>
  <path class="chim" d="M128,196 V102 H182 V152"/>
  <path class="chim" d="M155,96 q-12,-12 0,-24 t0,-24"/>
  ${ROOMS.map((r) => room(r, prog)).join('')}
  <path class="frame" d="M24,272 L312,56 L600,272"/>
  <path class="frame" d="M50,262 V694 Q312,706 574,694 V262"/>
  ${pillar('trust', 'L', 'TRUST')}${pillar('commitment', 'R', 'COMMITMENT')}
  </svg>`;
}

export const legendHtml = () => `<div class="legend"><span><i class="i-strength"></i>Strength</span><span><i class="i-mixed"></i>Mixed</span><span><i class="i-growth"></i>Growth area</span><span><i class="i-none"></i>Not rated</span></div>`;

export const logoSvg = () => `<svg class="logo" viewBox="0 0 64 64" role="img" aria-label="House logo"><path d="M32 6 L58 28 V58 H6 V28 Z" fill="none" stroke="#4B2882" stroke-width="4" stroke-linejoin="round"/><rect x="11" y="30" width="7" height="26" fill="#00693E"/><rect x="46" y="30" width="7" height="26" fill="#00693E"/><path d="M22 30 H42 M22 38 H42 M22 46 H42" stroke="#4B2882" stroke-width="3" stroke-linecap="round"/></svg>`;
