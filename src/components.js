/* Primitivos do protótipo — espelham as classes do Design System UniAnchieta 3.0.
   Uma primária por tela. Status é ponto + palavra. Callout leva o tom num trilho de 2px. */

const I = (name, cls = '') => (ICONS[name] || '').replace('<svg', `<svg class="icon ${cls}" aria-hidden="true"`);

const STUDENT = {
  nome: 'Victor Capitani Pansonato', ini: 'VP', ra: '2607454',
  curso: 'Bacharelado em Ciências Contábeis', turno: 'Noturno',
};

function btn(label, o = {}) {
  const v = o.v || 'secondary';
  const cls = ['btn', v, o.size || '', o.square ? 'square' : '', o.full ? 'full' : ''].join(' ');
  const inner = `${o.icon ? I(o.icon, o.size === 'xs' ? 'i35' : '') : ''}${o.square ? '' : label}${o.iconRight ? I(o.iconRight, 'i35') : ''}`;
  const aria = o.square ? ` aria-label="${label}"` : '';
  if (o.href && !o.disabled) return `<a class="${cls}" href="${o.href}"${aria}>${inner}</a>`;
  return `<button class="${cls}"${o.disabled ? ' disabled' : ''}${aria}>${inner}</button>`;
}

/* STATUS: veredito. healthy = melhor faixa, só a palavra, sem ponto. */
function status(label, tone = 'neutral', solid = false) {
  if (tone === 'healthy') return `<span class="status healthy">${label}</span>`;
  return `<span class="status ${solid ? 'solid ' + tone : ''}"><span class="dot ${tone}"></span>${label}</span>`;
}
const tag = (t, cls = '') => `<span class="tag ${cls}">${t}</span>`;

function callout(tone, title, text, o = {}) {
  const icon = o.icon === false ? '' : `<span class="c-icon">${I(o.icon || (tone === 'crit' || tone === 'warn' ? 'triangle-alert' : 'info'))}</span>`;
  return `<div class="callout ${tone}">${icon}<div class="c-body">${title ? `<p class="c-title">${title}</p>` : ''}${text ? `<div class="c-text">${text}</div>` : ''}${o.after || ''}</div>${o.action ? `<div class="c-action">${o.action}</div>` : ''}</div>`;
}

function field(label, control, o = {}) {
  return `<div><div class="field-top"><span class="field-label">${label}${o.required ? '<span class="req">*</span>' : ''}</span>${o.hint ? `<span class="field-hint">${o.hint}</span>` : ''}</div>${control}${o.help ? `<p class="help">${o.help}</p>` : ''}</div>`;
}
const ctrl = (value, o = {}) => `<div class="control ${o.cls || ''}">${o.icon ? `<span style="color:var(--ink-4)">${I(o.icon, 'i35')}</span>` : ''}${value ? `<span${o.mono ? ' class="mono"' : ''}>${value}</span>` : `<span class="ph">${o.ph || ''}</span>`}${o.trail ? `<span class="trail">${I(o.trail, 'i35')}</span>` : ''}</div>`;

const dl = (items, cols = 4) => `<dl class="dl c${cols}">${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;

function hint(label, text) {
  return `<span class="hint" tabindex="0" role="button" aria-label="Como ${label} é calculado" data-hint>${I('info', 'i35')}<span class="hint-pop" role="tooltip" hidden>${text}</span></span>`;
}

function meter(pct, o = {}) {
  return `<div class="meter" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"${o.label ? ` aria-label="${o.label}"` : ''}><span class="fill ${o.tone || ''}" style="width:${pct}%"></span>${o.target ? `<span class="target" style="left:calc(${o.target}% - 1px)" title="mínimo ${o.target}%"></span>` : ''}</div>`;
}

/* Frequência contra o mínimo. Abaixo do mínimo = âmbar (atenção), não vermelho:
   a compensação ainda vai recalcular. */
function freq(pct, o = {}) {
  const min = 75, below = pct < min;
  return `<div><div class="between" style="margin-bottom:6px"><span class="small" style="font-weight:500">Frequência ${hint('a frequência', 'Presença registrada na disciplina até hoje. O mínimo para aprovação é 75%. Quando a atividade de compensação é avaliada como satisfatória, as faltas do período do atestado são abonadas e a frequência é recalculada.')}</span><span class="freq-v ${below ? 'warn' : ''}">${pct}%${o.after ? ` <span style="color:var(--ink-4);font-weight:400">→</span> <span style="color:var(--ink)">${o.after}%</span>` : ''}</span></div>${meter(o.after || pct, { target: min, tone: (o.after || pct) < min ? 'warn' : '', label: 'Frequência' })}<div class="between tiny" style="margin-top:5px"><span>${o.note || (below ? 'Sobe com a compensação' : 'Acima do mínimo')}</span><span>mínimo 75%</span></div></div>`;
}

/* Timeline: done | current | next | alert | warn */
function timeline(items) {
  const icon = { done: 'check', current: 'circle-dot', next: 'clock', alert: 'circle-x', warn: 'rotate-ccw' };
  return `<ol class="tl">${items.map(it => `<li class="${it.state === 'next' ? 'is-next' : ''}"><span class="tl-node ${it.state === 'done' ? '' : it.state}">${I(it.icon || icon[it.state], 'i35')}</span><div class="tl-body"><div class="between" style="align-items:baseline;flex-wrap:wrap;gap:2px 12px"><p class="tl-title">${it.title}</p>${it.stamp ? `<span class="tl-stamp">${it.stamp}</span>` : ''}</div>${it.detail ? `<p class="tl-detail">${it.detail}</p>` : ''}</div></li>`).join('')}</ol>`;
}

function fileRow(name, size, o = {}) {
  return `<div class="file">${I('file-text', 'i35')}<span class="file-name">${name}</span><span class="tiny mono">${size}</span>${o.remove ? btn('Remover arquivo', { v: 'ghost', square: true, icon: 'x', size: 'xs' }) : ''}${o.action || ''}</div>`;
}

function segmented(opts, active) {
  return `<div class="seg-track" role="tablist">${opts.map(([l, n], i) => `<button role="tab" aria-selected="${i === active}" class="seg-btn ${i === active ? 'active' : ''}">${l}${n !== undefined ? `<span class="seg-count">${n}</span>` : ''}</button>`).join('')}</div>`;
}

function modal({ title, sub, icon, body, foot, size = 'lg', close = '' }) {
  return `<div class="scrim" data-close="${close}"><div class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="mt"><header class="modal-head"><div class="row-flex" style="gap:12px;flex-wrap:nowrap;align-items:flex-start">${icon ? `<span class="modal-ico">${I(icon)}</span>` : ''}<div><h2 class="modal-title" id="mt">${title}</h2>${sub ? `<p class="modal-sub">${sub}</p>` : ''}</div></div>${close ? `<a class="close" href="${close}" aria-label="Fechar">${I('x')}</a>` : `<button class="close" aria-label="Fechar">${I('x')}</button>`}</header><div class="modal-body">${body}</div>${foot ? `<footer class="modal-foot">${foot}</footer>` : ''}</div></div>`;
}

function drawer({ title, statusHtml, body, foot, close = '' }) {
  return `<div class="drawer-scrim"><aside class="drawer" role="dialog" aria-modal="true" aria-label="${title}"><header class="modal-head" style="padding:18px 24px"><div><h2 class="drawer-title">${title}</h2>${statusHtml ? `<div style="margin-top:6px">${statusHtml}</div>` : ''}</div><a class="close" href="${close}" aria-label="Fechar">${I('x')}</a></header><div class="modal-body">${body}</div>${foot ? `<footer class="modal-foot" style="padding:14px 24px">${foot}</footer>` : ''}</aside></div>`;
}

/* ---------- Shell ---------- */
function sidebar(persona, active) {
  const items = persona === 'equipe'
    ? [['inbox', 'Solicitações', '#/c-painel', 12, true], ['layers', 'Estudo dirigido', '#/c-painel', undefined], ['book-open', 'Portaria e manual', '#/', undefined]]
    : [['file-plus-2', 'Nova solicitação', '#/j2-01', undefined], ['list-checks', 'Minhas solicitações', '#/g-lista', 1], ['book-open', 'Manual do aluno', '#/', undefined]];
  const who = persona === 'equipe'
    ? `<div class="who"><span class="avatar surface">AC</span><div style="min-width:0"><p class="who-name">Assistência de Coordenação</p><p class="who-sub">Ciências Contábeis</p></div></div>`
    : `<div class="who"><span class="avatar surface">${STUDENT.ini}</span><div style="min-width:0"><p class="who-name">${STUDENT.nome}</p><p class="who-sub">RA <span class="mono">${STUDENT.ra}</span></p></div></div>`;
  return `<aside class="sidebar"><div class="brand-zone"><span class="brand-mark">A</span><div><p class="brand-name">UniAnchieta</p><p class="brand-unit">${persona === 'equipe' ? 'Coordenação' : 'Compensação'}</p></div></div><nav class="nav">${items.map(([ic, l, h, n, urgent], i) => `<a class="nav-item ${i === active ? 'active' : ''}" href="${h}">${I(ic)}<span class="label">${l}</span>${n !== undefined ? `<span class="nav-badge ${urgent && i !== active ? 'crit' : ''}">${n}</span>` : ''}</a>`).join('')}</nav><div class="side-foot">${who}<div style="display:flex;gap:8px"><button class="pill-btn" style="flex:1" data-theme>${I('sun', 'i35')}<span data-theme-label>Claro</span></button></div></div></aside>`;
}

function header(crumbs, persona) {
  const unread = persona === 'equipe' ? 3 : 1;
  return `<header class="header"><div class="header-in"><div class="crumbs">${crumbs.map((c, i) => i === crumbs.length - 1 ? `<b>${c}</b>` : `<span>${c}</span>${I('chevron-right', 'i3')}`).join('')}</div><div class="header-right">${tag('Dados fictícios')}<span class="vsep"></span><span class="bell">${btn('Notificações', { v: 'ghost', square: true, icon: 'bell' })}<span class="bell-count">${unread}</span></span></div></div></header>`;
}

function shell({ persona = 'aluno', nav = 0, crumbs = [], content = '', overlay = '' }) {
  return `<div class="app">${sidebar(persona, nav)}<div class="main-col">${header(crumbs, persona)}<main><div class="container">${content}</div></main></div></div>${overlay}`;
}
