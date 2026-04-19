import type { AppState } from '@/hooks/useAppState';
import { getDeepCleanRooms } from '@/data/deepCleanRooms';
import { APP_NAME, BRAND_LINKS, BRAND_NAME, LEGAL_NOTICE } from '@/config/brand';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function exportStateAsJson(state: AppState) {
  const payload = { app: APP_NAME, brand: BRAND_NAME, version: 2, exportedAt: new Date().toISOString(), legalNotice: LEGAL_NOTICE, officialLinks: BRAND_LINKS, state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `dollhouse-backup-${timestamp()}.json`);
}

interface PdfOptions { state: AppState; scope: 'daily' | 'deepclean' | 'challenge' | 'all'; }

export function exportPrintablePdf({ state, scope }: PdfOptions) {
  const html = buildPrintableHtml(state, scope);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=820,height=900');
  if (!win) {
    const blob = new Blob([html], { type: 'text/html' });
    triggerDownload(blob, `dollhouse-${scope}-${timestamp()}.html`);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => { setTimeout(() => { win.focus(); win.print(); }, 300); };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildPrintableHtml(state: AppState, scope: PdfOptions['scope']): string {
  const sections: string[] = [];
  if (scope === 'daily' || scope === 'all') sections.push(renderDaily(state));
  if (scope === 'deepclean' || scope === 'all') sections.push(renderDeep(state));
  if (scope === 'challenge' || scope === 'all') sections.push(renderChallenge(state));
  if (scope === 'all') sections.push(renderHeroicDeeds(state));
  const title = state.userName ? `${state.userName}'s Dollhouse Checklist` : `herDOLLHOUSE Checklist`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>@page{margin:18mm 16mm}:root{--ink:#2d2d3d;--champagne:#f2e4b3;--rose-gold:#e5c1d3;--blush:#eac1c8;--soft:#f7efe7}*{box-sizing:border-box}body{font-family:'Playfair Display',Georgia,serif;color:var(--ink);margin:0;background:#fff}header{border-bottom:1.5px solid var(--champagne);padding-bottom:14px;margin-bottom:22px}h1{font-size:28pt;font-weight:600;letter-spacing:.04em;margin:0}.sub{font-family:system-ui,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.25em;color:var(--rose-gold);margin-top:6px}h2{font-size:16pt;border-left:3px solid var(--rose-gold);padding-left:10px;margin:24px 0 12px}h3{font-size:12pt;color:var(--champagne);margin:14px 0 6px;text-transform:uppercase;letter-spacing:.18em}ul{list-style:none;padding:0;margin:0 0 12px}li{font-family:system-ui,sans-serif;font-size:11pt;padding:5px 0;border-bottom:1px dotted #e7d8c8;display:flex;align-items:flex-start;gap:10px}.box{width:13px;height:13px;border:1.4px solid var(--champagne);border-radius:3px;flex-shrink:0;margin-top:3px}.box.done{background:var(--blush);border-color:var(--rose-gold)}.zone{font-size:8.5pt;color:var(--rose-gold);text-transform:uppercase;letter-spacing:.15em;margin-left:auto;padding-left:12px}footer{margin-top:36px;padding-top:14px;border-top:1px solid var(--blush);text-align:center;font-family:system-ui,sans-serif;font-size:8.5pt;color:#8a7878;letter-spacing:.2em;text-transform:uppercase}</style></head><body><header><h1>${escapeHtml(title)}</h1><div class="sub">${escapeHtml(BRAND_NAME)} · ADHD Cleaning Planner · ${new Date().toLocaleDateString()}</div></header>${sections.join('\n')}<footer>${escapeHtml(LEGAL_NOTICE)}</footer></body></html>`;
}

function renderDaily(state: AppState): string {
  const periods: Array<['morning' | 'afternoon' | 'evening', string]> = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']];
  const blocks = periods.map(([k, label]) => {
    const items = state.dailyTasks[k].map((t) => `<li><span class="box ${t.completed ? 'done' : ''}"></span><span>${escapeHtml(t.label)}</span><span class="zone">${escapeHtml(t.zone)}</span></li>`).join('');
    return `<h3>${label}</h3><ul>${items || '<li><em>No tasks</em></li>'}</ul>`;
  }).join('');
  return `<section><h2>Daily Routines · ${escapeHtml(state.day)}</h2>${blocks}</section>`;
}

function renderDeep(state: AppState): string {
  const rooms = getDeepCleanRooms();
  const blocks = rooms.map((room) => {
    const items = room.tasks.map((t) => { const done = state.deepCleanTasks[room.id]?.[t.id] ?? false; return `<li><span class="box ${done ? 'done' : ''}"></span><span>${escapeHtml(t.label)}</span></li>`; }).join('');
    return `<h3>${escapeHtml(room.name)}</h3><ul>${items}</ul>`;
  }).join('');
  return `<section><h2>Deep Clean Checklist</h2>${blocks}</section>`;
}

function renderChallenge(state: AppState): string {
  const items = Array.from({ length: 30 }, (_, i) => i + 1).map((d) => { const done = !!state.challengeDays[d]; return `<li><span class="box ${done ? 'done' : ''}"></span><span>Day ${d}</span></li>`; }).join('');
  return `<section><h2>30-Day Challenge</h2><ul>${items}</ul></section>`;
}

function renderHeroicDeeds(state: AppState): string {
  const deeds = state.heroicDeeds ?? [];
  const items = deeds.slice(0, 20).map((deed) => `<li><span class="box done"></span><span>${escapeHtml(deed.label)}<br /><small>${escapeHtml(deed.flourish)}</small></span><span class="zone">${escapeHtml(deed.zone)}</span></li>`).join('');
  return `<section><h2>Heroic Deeds Log</h2><ul>${items || '<li><em>No heroic deeds recorded yet</em></li>'}</ul></section>`;
}
