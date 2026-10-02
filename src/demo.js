/* Compensação de ausências · demonstração funcional (v4)
   Aluno envia → coordenação aprova → professor publica e avalia → aluno compensado.
   O aluno só envia o documento e, quando houver, a atividade. O resto é do sistema. */

const LOGO = URL.createObjectURL(new Blob([Uint8Array.from(atob(LOGO_B64), c => c.charCodeAt(0))], { type: 'image/png' }));
const EBOOK_URL = URL.createObjectURL(new Blob([Uint8Array.from(atob(EBOOK_B64), c => c.charCodeAt(0))], { type: 'application/pdf' }));
const EBOOK_NAME = 'Regulamento_simples_Compensacao_de_Ausencias.pdf';

/* ---------- Datas ---------- */
const TODAY = new Date(2026, 9, 1, 12);
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmt = s => { if (!s) return ''; const d = typeof s === 'string' ? parse(s) : s; return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
const short = s => fmt(s).slice(0, 5);
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5) + 1;
const modOf = dias => dias <= 14 ? 'auto' : dias <= 39 ? 'ativ' : 'ed';
const periodo = r => r.ini === r.fim ? `<span class="mono">${fmt(r.ini)}</span>` : `<span class="mono">${short(r.ini)}</span> a <span class="mono">${fmt(r.fim)}</span>`;
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Domínio ---------- */
const TIPOS = {
  atestado: { chip: 'Atestado médico', doc: 'o atestado médico', short: 'Atestado médico' },
  casamento: { chip: 'Certidão de casamento do(a) aluno(a) nubente', doc: 'a certidão de casamento', short: 'Certidão de casamento' },
  militar: { chip: 'Certidão de serviço militar obrigatório', doc: 'a certidão de serviço militar', short: 'Serviço militar obrigatório' },
  obito: { chip: 'Certidão de óbito de parente de 1º grau', doc: 'a certidão de óbito', short: 'Certidão de óbito' },
};
const MOD = {
  auto: { label: 'Até 14 dias', what: 'Faltas removidas automaticamente' },
  ativ: { label: 'De 15 a 39 dias', what: 'Uma atividade por disciplina' },
  ed: { label: '40 dias ou mais', what: 'Estudo dirigido' },
};
const PROFS = { mt: 'Prof. Marcos Teixeira', hd: 'Profa. Helena Duarte', ls: 'Profa. Lúcia Santos' };
const STUD = {
  s1: { nome: 'Beatriz Lima Fontes', first: 'Beatriz', ini: 'BF', ra: '2620417', curso: 'Bacharelado em Ciências Contábeis', serie: '2ª série', ex: ['2026-09-29', '2026-10-01'],
    disc: [['Contabilidade Intermediária', 'CC-2-A-N', 'mt', 82], ['Matemática Financeira', 'CC-2-A-N', 'hd', 78]] },
  s2: { nome: 'Rafael Nunes Barreto', first: 'Rafael', ini: 'RB', ra: '2504913', curso: 'Análise e Desenvolvimento de Sistemas', serie: '4ª série', ex: ['2026-09-08', '2026-09-27'],
    disc: [['Banco de Dados Não Relacionais', 'ADS-3/4-A-N', 'mt', 80], ['Computação para Dispositivos Móveis', 'ADS-3/4-A-N', 'hd', 80], ['Qualidade e Teste de Software', 'ADS-3/4-A-N', 'mt', 85], ['Tópicos Framework', 'ADS-3/4-A-N', 'hd', 75], ['Metodologias Ágeis', 'ADS-3/4-A-N', 'hd', 80]] },
  s3: { nome: 'Juliana Prado Castilho', first: 'Juliana', ini: 'JC', ra: '2508841', curso: 'Licenciatura em Pedagogia', serie: '3ª série', ex: ['2026-09-01', '2026-10-15'],
    disc: [['História da Educação', 'PE-3-A-N', 'ls', 70], ['Didática e Prática Pedagógica', 'PE-3-A-N', 'ls', 72], ['Psicologia da Educação', 'PE-3-A-N', 'ls', 68]] },
  o1: { nome: 'Diego Santana Rocha', first: 'Diego', ini: 'DR', ra: '2403317', curso: 'Bacharelado em Administração', serie: '3ª série', disc: [['Gestão de Pessoas', 'AD-3-A-N', 'ls', 81]] },
  o2: { nome: 'Camila Freitas Lopes', first: 'Camila', ini: 'CL', ra: '2515560', curso: 'Análise e Desenvolvimento de Sistemas', serie: '2ª série', disc: [['Banco de Dados Não Relacionais', 'ADS-1/2-A-N', 'mt', 72], ['Metodologias Ágeis', 'ADS-1/2-A-N', 'hd', 70]] },
};
const SCEN = [['s1', 'Aluno · até 14 dias'], ['s2', 'Aluno · 15 a 39 dias'], ['s3', 'Aluno · 40 dias ou mais'], ['coord', 'Coordenação'], ['prof', 'Professor']];
const MOTIVOS = ['Documento ilegível', 'Datas diferentes das informadas', 'Documento não aceito para compensação', 'Documento sem assinatura ou carimbo'];

/* ---------- Estado ---------- */
const KEY = 'compensacao-demo-v4';
function fresh() {
  return {
    view: 's2', prof: 'mt', coordTab: 'pend', coordSel: null, coordAdj: null, nextId: 3270,
    drafts: {}, avisoSeen: {}, notices: { s1: [], s2: [], s3: [] }, bell: false, modal: null,
    reqs: [
      { id: 3262, sid: 'o1', tipo: 'obito', ini: '2026-09-22', fim: '2026-09-24', files: ['certidao-obito.pdf'], msg: '', status: 'analise', sent: '2026-09-29' },
      { id: 3265, sid: 'o2', tipo: 'atestado', ini: '2026-09-02', fim: '2026-09-23', files: ['atestado-medico.pdf'], msg: 'Fiquei internada por dengue.', status: 'analise', sent: '2026-09-30' },
    ],
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); }
S.modal = null; S.bell = false;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const reqOf = sid => [...S.reqs].reverse().find(r => r.sid === sid);
const draftOf = sid => (S.drafts[sid] = S.drafts[sid] || { tipo: 'atestado', ini: '', fim: '', files: [], agree: false, msg: '', showMsg: false });
const notify = (sid, title, text) => { if (S.notices[sid]) S.notices[sid].unshift({ title, text, at: fmt(TODAY), read: false }); };

let toastTimer;
function toast(title, detail) {
  const el = document.getElementById('toast');
  el.innerHTML = `<div class="toast-in"><span class="toast-bar"></span>${I('circle-check')}<div><p class="toast-t">${title}</p>${detail ? `<p class="toast-d">${detail}</p>` : ''}</div></div>`;
  el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 3600);
}

/* ---------- Primitivos locais ---------- */
const A = (label, action, o = {}) => `<button class="btn ${o.v || 'secondary'} ${o.size || ''} ${o.full ? 'full' : ''} ${o.cls || ''}" data-a="${action}" ${Object.entries(o.data || {}).map(([k, v]) => `data-${k}="${v}"`).join(' ')} ${o.disabled ? 'disabled' : ''}>${o.icon ? I(o.icon, o.size === 'xs' ? 'i35' : '') : ''}${label}${o.iconRight ? I(o.iconRight, 'i35') : ''}</button>`;
const logoImg = (h = 30) => `<img src="${LOGO}" alt="UniAnchieta" style="height:${h}px;width:auto;display:block">`;
const ebookCard = (t = 'Regulamento simples') => `<a class="ebook-link" href="${EBOOK_URL}" download="${EBOOK_NAME}"><span class="ebook-ico">${I('book-open')}</span><span style="flex:1;min-width:0"><span class="strong" style="display:block;font-size:13px">${t}</span><span class="tiny" style="color:var(--ink-3)">PDF de 8 páginas, leitura de 3 minutos</span></span>${I('file-down', 'i35')}</a>`;
function stepper(labels, now) {
  return `<div class="steps" style="grid-template-columns:repeat(${labels.length},minmax(0,1fr))">${labels.map((l, i) => `<div class="st ${i < now ? 'done' : i === now ? 'now' : ''}" style="--i:${i}"><span class="bar"></span><span class="lbl">${l}</span></div>`).join('')}</div>`;
}
const empty = (icon, title, msg) => `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:48px 24px"><div class="hero-ok" style="width:44px;height:44px">${I(icon)}</div><div><p class="strong" style="font-size:13px">${title}</p><p class="small" style="max-width:24rem;margin:4px auto 0">${msg}</p></div></div>`;

/* ---------- Shell ---------- */
function shell({ persona, title, content, nav }) {
  const isAluno = persona === 'aluno';
  const sid = S.view;
  const pendCoord = S.reqs.filter(r => r.status === 'analise').length;
  const pendProf = profItems(S.prof).pub.length + profItems(S.prof).eval.length;
  const items = isAluno
    ? [['list-checks', 'Minha solicitação', 'noop'], ['info', 'Aviso importante', 'open-aviso']]
    : persona === 'coord' ? [['inbox', 'Documentos', 'noop', pendCoord]] : [['clipboard-list', 'Atividades', 'noop', pendProf]];
  const who = isAluno ? [STUD[sid].ini, STUD[sid].nome, `RA <span class="mono">${STUD[sid].ra}</span>`]
    : persona === 'coord' ? ['AC', 'Assistência de Coordenação', 'Coordenação de curso'] : [PROFS[S.prof].split(' ').slice(1).map(w => w[0]).join(''), PROFS[S.prof], 'Docente'];
  const unread = isAluno ? S.notices[sid].filter(n => !n.read).length : 0;
  const bell = isAluno ? `<span class="bell">${A('', 'bell', { v: 'ghost', icon: 'bell', cls: 'square' }).replace('<button', '<button aria-label="Avisos"')}${unread ? `<span class="bell-count">${unread}</span>` : ''}${S.bell ? noticesPop(sid) : ''}</span>` : '';
  const navHtml = items.map(([ic, l, a, n], i) => `<button class="nav-item ${i === 0 ? 'active' : ''}" data-a="${a}">${I(ic)}<span class="label">${l}</span>${n ? `<span class="nav-badge">${n}</span>` : ''}</button>`).join('') + `<a class="nav-item" href="${EBOOK_URL}" download="${EBOOK_NAME}">${I('book-open')}<span class="label">Regulamento simples</span><span class="nav-badge">PDF</span></a>`;
  const tabs = [...items.map(([ic, l, a], i) => `<button class="tab ${i === 0 ? 'on' : ''}" data-a="${a}">${I(ic)}${l.replace('Minha solicitação', 'Solicitação').replace('Aviso importante', 'Aviso')}</button>`), `<a class="tab" href="${EBOOK_URL}" download="${EBOOK_NAME}">${I('book-open')}Regulamento</a>`];
  return `<div class="app">
    <aside class="sidebar"><div class="brand-zone" style="flex-direction:column;align-items:flex-start;justify-content:center;gap:5px">${logoImg(34)}<p class="brand-unit" style="margin:0">Compensação de ausências</p></div>
      <nav class="nav">${navHtml}</nav>
      <div class="side-foot"><div class="who"><span class="avatar surface">${who[0]}</span><div style="min-width:0"><p class="who-name">${who[1]}</p><p class="who-sub">${who[2]}</p></div></div></div></aside>
    <div class="main-col">
      <header class="header"><div class="header-in"><div class="crumbs"><span>Compensação de ausências</span>${I('chevron-right', 'i3')}<b>${title}</b></div><div class="header-right">${tag('Dados fictícios')}${bell ? `<span class="vsep"></span>${bell}` : ''}</div></div></header>
      <div class="m-top">${logoImg(26)}<span class="r">${bell}</span></div>
      <main><div class="container">${content}</div></main>
    </div></div>
    <nav class="tabbar" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.join('')}</nav>`;
}
function noticesPop(sid) {
  const list = S.notices[sid];
  return `<div class="pop" role="dialog" aria-label="Avisos"><div class="pop-head"><span class="strong" style="font-size:12.5px">Avisos</span><span class="tiny">no aplicativo e no seu e-mail</span></div><div class="pop-list">${list.length ? list.map(n => `<div class="pop-item ${n.read ? '' : 'unread'}"><p class="strong" style="font-size:12.5px">${n.title}</p><p class="small" style="margin-top:2px">${n.text}</p><p class="mono tiny" style="margin-top:4px">${n.at}</p></div>`).join('') : `<div style="padding:24px 16px;text-align:center" class="small">Nenhum aviso ainda.</div>`}</div></div>`;
}

/* ---------- Aviso importante ---------- */
function avisoModal() {
  return `<div class="scrim" data-scrim><div class="modal md" role="dialog" aria-modal="true" aria-labelledby="av-t">
    <header class="modal-head"><div>${logoImg(26)}<h2 class="modal-title" id="av-t" style="margin-top:14px;font-size:17px">Aviso Importante</h2></div><button class="close" data-a="aviso-ok" aria-label="Fechar">${I('x')}</button></header>
    <div class="modal-body" style="padding:18px 20px" ><div class="aviso">
      <p>Prezado(a) aluno(a),</p>
      <p>Conforme o Regimento Interno do Centro Universitário (art. 111 e seguintes) e os Critérios de Rendimento Acadêmico — documentos disponíveis no Mural do Portal do Aluno (aplicativo) —, bem como a legislação vigente, não há abono de faltas no ensino superior, exceto nos casos de convocação para serviço militar e participação em reuniões do CONAES/SINAES.</p>
      <p>Somente alunos com doenças infectocontagiosas, limitações físicas que impeçam a frequência às aulas ou gestantes poderão solicitar regime especial de compensação de ausências — o qual não constitui abono de faltas —, desde que apresentem condições intelectuais e emocionais adequadas para dar continuidade às atividades acadêmicas fora do ambiente escolar.</p>
      <h3>Prova Substitutiva</h3>
      <p>Este sistema é utilizado apenas para compensação de ausência nas aulas diárias. Para solicitar Prova Substitutiva, acesse o Portal do Aluno:</p>
      <ol><li>Secretaria Virtual</li><li>Serviços › Nova Solicitação › Solicitar Serviço</li><li>Busque por "Prova Substitutiva"</li><li>Botão (solicitar)</li></ol>
    </div></div>
    <footer class="modal-foot">${A('Entendi', 'aviso-ok', { v: 'primary', size: 'md' })}</footer></div></div>`;
}

function edModal() {
  return `<div class="scrim" data-scrim><div class="modal md" role="dialog" aria-modal="true" aria-labelledby="ed-t">
    <header class="modal-head"><div class="row-flex" style="gap:12px;flex-wrap:nowrap;align-items:flex-start"><span class="modal-ico">${I('book-marked')}</span><div><h2 class="modal-title" id="ed-t">O que é o Estudo Dirigido?</h2><p class="modal-sub">Entenda como funciona antes de começar</p></div></div><button class="close" data-a="close-modal" aria-label="Fechar">${I('x')}</button></header>
    <div class="modal-body" style="padding:20px"><div class="aviso">
      <p>O Estudo Dirigido é um modelo de oferta de Dependência (DP). Nele, o cronograma de estudos, a dinâmica de trabalho e os critérios de avaliação ficam sob a responsabilidade do professor da disciplina.</p>
      <h3>Como funciona</h3><p>O modelo consiste majoritariamente na entrega de tarefas e atividades teóricas/práticas. Dependendo do cronograma estabelecido pelo docente, a modalidade também pode contemplar alguns encontros presenciais ao longo do semestre.</p>
      <h3>Onde acompanhar</h3><p>É fundamental acompanhar frequentemente o ambiente virtual (AVA) diretamente no card da disciplina para não perder os prazos de postagem de atividades, conteúdos ou recados do professor.</p>
      <div class="ed-sep"></div>
      <h3 class="row-flex" style="gap:8px">${I('laptop', 'i35')}E o Digital Especial?</h3><p>O Digital Especial é outra modalidade de oferta para o cumprimento de Dependência (DP), funcionando de maneira muito parecida com o Estudo Dirigido, porém com foco totalmente virtual.</p>
      <h3>Como funciona</h3><p>Nessa modalidade, todo o processo pedagógico ocorre de forma 100% online. Isso engloba o acesso a aulas gravadas, materiais de apoio, realização de atividades e envio de trabalhos acadêmicos.</p>
      <h3>Onde acompanhar</h3><p>Todas as etapas, prazos e orientações do professor ficam disponíveis exclusivamente no AVA, no card correspondente à disciplina. O acesso regular ao ambiente virtual é indispensável para evitar a perda de prazos e entregas.</p>
    </div></div>
    <footer class="modal-foot">${A('Entendi', 'close-modal', { v: 'primary', size: 'md' })}</footer></div></div>`;
}

/* ---------- Aluno: formulário ---------- */
const CASES = {
  auto: (r) => ({ title: 'Você não precisa fazer mais nada', items: [
    ['user-check', 'A coordenação confere o seu documento.'],
    ['circle-check', 'Com tudo certo, <b>suas faltas do período serão removidas automaticamente</b>, em todas as disciplinas.'],
    ['graduation-cap', 'Perdeu alguma prova nesse período? A <b>prova substitutiva</b> é pedida no Portal do Aluno, na Secretaria Virtual.'],
  ] }),
  ativ: (r) => ({ title: 'Você fará uma atividade por disciplina', items: [
    ['mail-check', 'As atividades <b>chegam até você pelo aplicativo e por e-mail</b>. Não precisa procurar.'],
    ['calendar-check', `Prazo para entregar: <b>${fmt(addDays(r.fim, 15))}</b>, 15 dias depois do fim do afastamento.`],
    ['circle-check', 'Se a atividade for aceita, as faltas daquela disciplina são compensadas. Se não for, você tem <b>uma segunda chance</b>.'],
  ] }),
  ed: (r) => ({ title: 'Suas disciplinas vão para o estudo dirigido, sem custo', items: [
    ['zap', '<b>Elas entram automaticamente.</b> Você não precisa se inscrever.'],
    ['calendar-check', 'Você começa depois do fim do afastamento, nas datas do calendário acadêmico. Tudo aparece no card da disciplina no AVA.'],
    ['triangle-alert', `<b class="must-ink">Até ${fmt(r.fim)}, não faça atividades ou provas no AVA.</b> Elas seriam anuladas.`],
  ] }),
};
function alunoForm(sid) {
  const d = draftOf(sid), st = STUD[sid];
  const req = reqOf(sid);
  const valid = d.ini && d.fim && parse(d.fim) >= parse(d.ini);
  const dias = valid ? daysBetween(d.ini, d.fim) : 0;
  const mod = valid ? modOf(dias) : null;
  const ok = valid && d.files.length && d.agree;
  const missing = !valid ? 'Informe o primeiro e o último dia.' : !d.files.length ? `Falta anexar ${TIPOS[d.tipo].doc}.` : !d.agree ? 'Falta confirmar que você entendeu o aviso acima.' : '';
  const k = mod ? CASES[mod](d) : null;
  return `<div class="narrow stack">
    <div><h1 class="page-title">Olá, ${st.first}</h1><p class="page-desc">Envie o seu documento em menos de um minuto. Depois, avisamos você pelo aplicativo e por e-mail a cada etapa.</p></div>
    ${req && req.status === 'ajuste' ? callout('warn', 'Reenvio da solicitação #' + req.id, `Motivo do ajuste: ${esc(req.motivo)}. Corrija e envie de novo.`) : ''}
    <section class="card stack">
      <div class="stack-sm"><p class="q"><span class="step-n done">${I('check', 'i3')}</span>Qual é o documento?</p>
        <div class="choices">${Object.entries(TIPOS).map(([key, t]) => `<button class="choice ${d.tipo === key ? 'on' : ''}" data-a="tipo" data-t="${key}">${t.chip}</button>`).join('')}</div>
        <p class="must">${I('circle-x', 'i35')}Declarações de trabalho ou outras justificativas não previstas na legislação não são aceitas.</p></div>
      <div class="stack-sm"><div class="between"><p class="q"><span class="step-n ${valid ? 'done' : ''}">${valid ? I('check', 'i3') : '2'}</span>De quando até quando?</p>${valid ? '' : `<button class="link-btn" data-a="example">${I('calendar', 'i35')}Usar datas de exemplo</button>`}</div>
        <div class="form-grid fg-2 dates">${field('Primeiro dia', `<input type="date" class="control mono" data-in="ini" value="${d.ini}" aria-label="Primeiro dia">`)}${field('Último dia', `<input type="date" class="control mono" data-in="fim" value="${d.fim}" aria-label="Último dia">`)}</div>
        ${d.ini && d.fim && !valid ? `<p class="help" style="color:var(--crit-ink);font-weight:500">O último dia não pode ser antes do primeiro.</p>` : !valid ? `<p class="tiny">Com as datas, mostramos exatamente o que vai acontecer no seu caso.</p>` : ''}</div>
      ${k ? `<div class="case"><p class="case-eyebrow">${dias} ${dias === 1 ? 'dia' : 'dias'} de afastamento · ${MOD[mod].label}</p><h2 class="case-title">${k.title}</h2><ul class="case-list">${k.items.map(([ic, t]) => `<li>${I(ic, 'i35')}<span>${t}</span></li>`).join('')}</ul>${mod === 'ed' ? `<button class="link-btn case-more" data-a="open-ed">${I('book-marked', 'i35')}O que é o Estudo Dirigido?</button>` : ''}</div>` : ''}
      <div class="stack-sm" ${valid ? '' : 'style="opacity:.45;pointer-events:none"'}><p class="q"><span class="step-n ${d.files.length ? 'done' : ''}">${d.files.length ? I('check', 'i3') : '3'}</span>Anexe ${TIPOS[d.tipo].doc}</p>
        <input type="file" id="f-doc" data-in="files" multiple accept=".pdf,.doc,.docx,image/*" hidden>
        ${d.files.map((f, i) => `<div class="file" style="background:var(--surface-2)">${I('file-text', 'i35')}<span class="file-name">${esc(f)}</span><button class="btn ghost xs square" data-a="rm-file" data-i="${i}" aria-label="Remover arquivo">${I('x', 'i35')}</button></div>`).join('')}
        ${d.files.length ? `<button class="link-btn" data-a="pick" data-target="f-doc">${I('paperclip', 'i35')}Anexar outro arquivo</button>` : `<button class="drop" style="width:100%;text-align:left" data-a="pick" data-target="f-doc"><span class="drop-ico">${I('upload')}</span><span style="flex:1;min-width:0"><span class="strong" style="display:block;font-size:13px">Toque para anexar ou tirar uma foto</span><span class="tiny">PDF, Word ou imagem. Pode enviar mais de um arquivo.</span></span></button>`}</div>
      <label class="check-row" ${valid ? '' : 'style="opacity:.45;pointer-events:none"'}><input type="checkbox" data-in="agree" ${d.agree ? 'checked' : ''} class="sr"><span class="checkbox ${d.agree ? 'on' : ''}">${d.agree ? I('check', 'i3') : ''}</span><span class="small" style="color:var(--ink-2)">Entendi que, durante o afastamento, <b class="must-ink">não posso fazer atividades e provas no AVA</b>. Posso assistir às aulas e ler os materiais.</span></label>
      ${d.showMsg ? field('Recado para a coordenação (opcional)', `<textarea class="control" rows="2" style="min-height:64px" data-in="msg" placeholder="Se quiser, explique algo sobre o documento">${esc(d.msg)}</textarea>`) : ''}
      <div class="stack-sm">${A('Enviar documento', 'submit', { v: 'primary', size: 'md', icon: 'send', full: true, disabled: !ok })}
        <p class="notify-line" style="justify-content:center">${ok ? `${I('mail-check', 'i35')}Você recebe um aviso no aplicativo e por e-mail a cada etapa.` : `${I('info', 'i35')}${missing}`}</p>
        ${d.showMsg ? '' : `<button class="link-btn" style="justify-content:center;width:100%" data-a="show-msg">${I('message-circle', 'i35')}Quer deixar um recado para a coordenação? (opcional)</button>`}</div>
    </section>
    ${ebookCard('Dúvidas? Veja o regulamento simples')}</div>`;
}

/* ---------- Aluno: acompanhamento ---------- */
function discRow(r, d, i) {
  let st, body = '', action = '';
  if (d.st === 'aguardando') { st = status('Aguardando o professor', 'neutral'); body = 'O professor está preparando a atividade. Ela chega até você pelo aplicativo e por e-mail.'; }
  if (d.st === 'publicada') { st = status('Para entregar', 'info', true); body = `Entregue até <b class="mono" style="font-weight:500;color:var(--ink)">${fmt(d.prazo)}</b> às 23h59.`; action = A('Enviar atividade', 'act-open', { v: 'secondary', icon: 'upload', data: { d: i } }); }
  if (d.st === 'entregue') { st = status('Entregue', 'neutral'); body = `Você entregou em <span class="mono">${fmt(d.entAt)}</span>. O professor vai avaliar.`; }
  if (d.st === 'refazer') { st = status('Segunda chance', 'warn', true); body = `<div class="quote" style="margin-top:2px">${esc(d.devolutiva)}<p class="quote-by">Comentário de ${PROFS[d.prof]}</p></div><p style="margin-top:8px">Reenvie até <b class="mono" style="font-weight:500;color:var(--ink)">${fmt(d.prazo2)}</b> às 23h59.</p>`; action = A('Reenviar atividade', 'act-open', { v: 'secondary', icon: 'rotate-ccw', data: { d: i } }); }
  if (d.st === 'aceita') { st = status('Faltas compensadas', 'healthy'); body = `Atividade aceita em <span class="mono">${fmt(d.evalAt)}</span>.`; }
  if (d.st === 'recusada') { st = status('Não compensada', 'crit', true); body = 'A segunda entrega não foi aceita. As faltas desta disciplina continuam registradas.'; }
  if (d.st === 'ed') { st = status('No estudo dirigido', 'healthy'); body = 'Entrou automaticamente, sem custo. Acompanhe o card da disciplina no AVA.'; }
  return `<div class="drow ${d.st === 'recusada' ? 'crit' : ''}" style="--i:${i}"><div class="drow-main"><div class="row-flex" style="gap:8px 10px"><p class="row-title">${d.nome}</p>${st}</div><p class="row-sub"><span class="mono">${d.cod}</span><span>·</span><span>${PROFS[d.prof]}</span><span>·</span><span>Frequência <span class="mono">${d.freq}%</span></span></p><div class="small" style="margin-top:8px;color:var(--ink-2)">${body}</div></div>${action ? `<div class="drow-act">${action}</div>` : ''}</div>`;
}
function alunoTrack(sid, r) {
  const st = STUD[sid], mod = modOf(daysBetween(r.ini, r.fim)), dias = daysBetween(r.ini, r.fim);
  const labels = { auto: ['Enviado', 'Análise', 'Faltas removidas'], ativ: ['Enviado', 'Análise', 'Atividades', 'Faltas compensadas'], ed: ['Enviado', 'Análise', 'Estudo dirigido', 'Faltas compensadas'] }[mod];
  const now = r.status === 'analise' || r.status === 'ajuste' ? 1 : r.status === 'aprovada' ? 2 : labels.length;
  let main = '', list = '', extra = '';
  if (r.status === 'analise') main = `<div class="row-flex" style="gap:14px;flex-wrap:nowrap;align-items:flex-start"><div class="hero-ok" style="width:40px;height:40px">${I('clock')}</div><div><h2 class="big-title" style="font-size:19px">Recebemos seu documento</h2><p class="body-txt" style="margin-top:4px">A coordenação está conferindo. Assim que houver novidade, você recebe um aviso no aplicativo e por e-mail. Não precisa voltar aqui.</p></div></div>`;
  if (r.status === 'ajuste') main = `<div class="row-flex" style="gap:14px;flex-wrap:nowrap;align-items:flex-start"><div class="hero-ok" style="width:40px;height:40px;background:var(--warn-soft);color:var(--warn-ink)">${I('triangle-alert')}</div><div style="flex:1"><h2 class="big-title" style="font-size:19px">Precisamos de um ajuste</h2><p class="body-txt" style="margin-top:4px"><b style="font-weight:600;color:var(--ink)">${esc(r.motivo)}.</b> ${r.obs ? esc(r.obs) + ' ' : ''}Corrija e envie de novo. Leva menos de um minuto.</p><div style="margin-top:14px">${A('Enviar novamente', 'resend', { v: 'primary', size: 'md', icon: 'rotate-ccw' })}</div></div></div>`;
  if (r.status === 'compensada' && mod === 'auto') main = `<div class="row-flex" style="gap:14px;flex-wrap:nowrap;align-items:flex-start"><div class="hero-ok" style="width:40px;height:40px">${I('circle-check')}</div><div><h2 class="big-title" style="font-size:19px">Tudo certo, ${st.first}</h2><p class="body-txt" style="margin-top:4px">Suas faltas de ${periodo(r)} foram removidas em todas as disciplinas. Não há nada para você fazer.</p></div></div>`;
  if (mod === 'ativ' && r.disc && (r.status === 'aprovada' || r.status === 'compensada' || r.status === 'concluida')) {
    const todo = r.disc.filter(d => d.st === 'publicada' || d.st === 'refazer').length;
    const done = r.disc.filter(d => d.st === 'aceita').length;
    const title = r.status === 'compensada' ? 'Pronto! Faltas compensadas em todas as disciplinas' : r.status === 'concluida' ? 'Compensação encerrada' : todo ? `Você tem ${todo} ${todo === 1 ? 'atividade' : 'atividades'} para entregar` : 'Nada para fazer agora';
    const sub = r.status === 'compensada' ? 'Todas as atividades foram aceitas.' : r.status === 'concluida' ? 'Veja abaixo o resultado de cada disciplina.' : todo ? 'Envie pelo botão de cada disciplina. Leva menos de um minuto.' : 'Os professores estão preparando as atividades. Cada uma chega até você pelo aplicativo e por e-mail.';
    main = `<p class="small" style="font-weight:500">O que fazer agora</p><h2 class="big-title" style="font-size:19px;margin-top:4px">${title}</h2><p class="body-txt" style="margin-top:4px">${sub}</p>
      <div class="between" style="margin-top:14px;gap:16px"><div style="flex:1;max-width:340px"><div class="between tiny" style="margin-bottom:6px"><span style="color:var(--ink-3);font-weight:500">Disciplinas compensadas</span><span class="mono" style="color:var(--ink)">${done} de ${r.disc.length}</span></div>${meter(Math.round(done / r.disc.length * 100), { tone: 'brand' })}</div><div style="text-align:right"><p class="tiny">Prazo das atividades</p><p class="mono" style="font-size:13px;font-weight:500">${fmt(addDays(r.fim, 15))}</p></div></div>`;
    list = `<section class="card flush"><div class="list-top"><span>Suas disciplinas</span><span><span class="mono">${r.disc.length}</span> no total</span></div><div class="divide">${r.disc.map((d, i) => discRow(r, d, i)).join('')}</div></section>`;
  }
  if (mod === 'ed' && r.status === 'aprovada') {
    main = `<p class="small" style="font-weight:500">O que fazer agora</p><h2 class="big-title" style="font-size:19px;margin-top:4px">Nada. Suas disciplinas já estão no estudo dirigido</h2><p class="body-txt" style="margin-top:4px">Sem custo e sem inscrição. Você começa depois do fim do afastamento, nas datas do calendário acadêmico, e tudo aparece no card da disciplina no AVA.</p><button class="link-btn" style="margin-top:12px" data-a="open-ed">${I('book-marked', 'i35')}O que é o Estudo Dirigido?</button>`;
    list = `<section class="card flush"><div class="list-top"><span>Estudo dirigido</span><span><span class="mono">${r.disc.length}</span> disciplinas</span></div><div class="divide">${r.disc.map((d, i) => discRow(r, d, i)).join('')}</div></section>`;
    extra = callout('crit', `Até ${fmt(r.fim)}, não faça atividades ou provas no AVA`, 'É o fim do seu afastamento. O que for feito antes disso é anulado. Assistir às aulas e ler os materiais pode.');
  }
  return `<div class="narrow stack">
    <div><p class="page-eyebrow">Solicitação <span class="mono">#${r.id}</span> · ${TIPOS[r.tipo].short} · ${dias} ${dias === 1 ? 'dia' : 'dias'}</p><h1 class="page-title">Olá, ${st.first}</h1></div>
    <section class="card stack">${stepper(labels, now)}${main}</section>${list}${extra}
    ${callout('ok', 'Perdeu alguma prova?', 'Este sistema é só para as faltas das aulas. A prova substitutiva é pedida no Portal do Aluno, na Secretaria Virtual.', { icon: 'graduation-cap', action: A('Ver como pedir', 'open-aviso', { v: 'on-inset', size: 'xs' }) })}
    ${ebookCard()}</div>`;
}
function entregaModal(sid, i) {
  const r = reqOf(sid), d = r.disc[i], second = d.st === 'refazer';
  return `<div class="scrim" data-scrim><div class="modal md" role="dialog" aria-modal="true" aria-labelledby="em-t">
    <header class="modal-head"><div class="row-flex" style="gap:12px;flex-wrap:nowrap;align-items:flex-start"><span class="modal-ico">${I('file-text')}</span><div><h2 class="modal-title" id="em-t">${d.nome}</h2><p class="modal-sub">${second ? 'Segunda chance' : 'Atividade de compensação'} · entrega até ${fmt(second ? d.prazo2 : d.prazo)} às 23h59</p></div></div><button class="close" data-a="close-modal" aria-label="Fechar">${I('x')}</button></header>
    <div class="modal-body stack" style="padding:20px">
      <div><p class="section-label">O que fazer</p><div class="quote" style="margin-top:10px;color:var(--ink)">${esc(d.enunciado)}</div>${d.anexo ? `<div class="file" style="background:var(--surface-2);margin-top:8px">${I('paperclip', 'i35')}<span class="file-name">${esc(d.anexo)}</span><span class="tiny">material do professor</span></div>` : ''}</div>
      ${second ? `<div><p class="section-label">O que ajustar</p><div class="quote" style="margin-top:10px">${esc(d.devolutiva)}</div></div>` : ''}
      <div><p class="section-label">Sua entrega</p><input type="file" id="f-act" hidden data-in="actfile"><div id="act-file" style="margin-top:10px">${S.actFile ? `<div class="file" style="background:var(--surface-2)">${I('file-text', 'i35')}<span class="file-name">${esc(S.actFile)}</span><button class="btn ghost xs square" data-a="pick" data-target="f-act" aria-label="Trocar arquivo">${I('rotate-ccw', 'i35')}</button></div>` : `<button class="drop" style="width:100%;text-align:left" data-a="pick" data-target="f-act"><span class="drop-ico">${I('upload')}</span><span style="flex:1"><span class="strong" style="display:block;font-size:13px">Toque para anexar sua atividade</span><span class="tiny">PDF, Word ou imagem.</span></span></button>`}</div></div>
    </div>
    <footer class="modal-foot">${A('Cancelar', 'close-modal', { v: 'ghost' })}${A(second ? 'Reenviar atividade' : 'Enviar atividade', 'act-send', { v: 'primary', icon: 'send', disabled: !S.actFile, data: { d: i } })}</footer></div></div>`;
}

/* ---------- Coordenação ---------- */
function coordView() {
  const pend = S.reqs.filter(r => r.status === 'analise').sort((a, b) => a.sent < b.sent ? -1 : 1);
  const done = S.reqs.filter(r => r.status !== 'analise' && r.decided).reverse();
  const list = S.coordTab === 'pend' ? pend : done;
  if (S.coordTab === 'pend' && (!S.coordSel || !pend.find(r => r.id === S.coordSel))) S.coordSel = pend[0] ? pend[0].id : null;
  const sel = S.reqs.find(r => r.id === S.coordSel);
  const item = (r, ix) => { const dd = daysBetween(r.ini, r.fim); return `<button class="row coord-item ${r.id === S.coordSel ? 'active' : ''}" style="--i:${ix}" data-a="coord-sel" data-id="${r.id}"><div class="between" style="gap:10px"><p class="row-title">${STUD[r.sid].nome}</p><span class="mono tiny">${short(r.sent)}</span></div><p class="row-sub">${tag(TIPOS[r.tipo].short)}<span><span class="mono">${dd}</span> ${dd === 1 ? 'dia' : 'dias'}</span></p><p class="tiny" style="margin-top:4px">${MOD[modOf(dd)].what}</p>${S.coordTab === 'done' ? `<div style="margin-top:6px">${r.status === 'ajuste' ? status('Ajuste pedido', 'warn') : status('Aprovada', 'healthy')}</div>` : ''}</button>`; };
  let detail = '';
  if (S.coordTab === 'pend' && sel) {
    const dd = daysBetween(sel.ini, sel.fim), mod = modOf(dd), st = STUD[sel.sid];
    const after = { auto: 'as faltas do período são removidas automaticamente no Lyceum, em todas as disciplinas, e o aluno é avisado.', ativ: `as atividades são criadas para os professores de ${st.disc.length} ${st.disc.length === 1 ? 'disciplina' : 'disciplinas'} e o aluno é avisado.`, ed: `as ${st.disc.length} disciplinas entram no estudo dirigido, sem custo, e o aluno é avisado.` }[mod];
    detail = `<section class="card stack">
      <div class="row-flex" style="gap:14px;flex-wrap:nowrap"><span class="avatar lg">${st.ini}</span><div style="min-width:0"><h2 class="big-title" style="font-size:20px">${st.nome}</h2><p class="small">RA <span class="mono">${st.ra}</span> · ${st.curso} · ${st.serie}</p></div></div>
      ${dl([['Documento', TIPOS[sel.tipo].short], ['Período', periodo(sel)], ['Dias', `<span class="mono">${dd}</span>`], ['Caminho', MOD[mod].what]], 4)}
      <div><p class="section-label">Documento enviado</p><div class="stack-sm" style="margin-top:10px">${sel.files.map(f => `<div class="file" style="background:var(--surface-2)">${I('file-text', 'i35')}<span class="file-name">${esc(f)}</span>${A('Abrir', 'doc-open', { v: 'on-inset', size: 'xs', icon: 'external-link', data: { f: esc(f) } })}</div>`).join('')}</div>
        <p class="help">Confira: nome do aluno, datas e assinatura ou carimbo.</p></div>
      ${sel.msg ? `<div><p class="section-label">Recado do aluno</p><div class="quote" style="margin-top:10px">${esc(sel.msg)}</div></div>` : ''}
      ${S.coordAdj === sel.id ? `<div class="stack-sm"><p class="section-label">Motivo do ajuste</p><div class="choices">${MOTIVOS.map(m => `<button class="choice ${S.coordMotivo === m ? 'on' : ''}" data-a="motivo" data-m="${m}">${m}</button>`).join('')}</div><textarea class="control" rows="2" style="min-height:60px" id="adj-obs" placeholder="Observação para o aluno (opcional)">${esc(S.coordObs || '')}</textarea>
        <div class="row-flex" style="justify-content:flex-end">${A('Voltar', 'adj-cancel', { v: 'ghost' })}${A('Enviar ao aluno', 'adj-send', { v: 'primary', icon: 'send', disabled: !S.coordMotivo, data: { id: sel.id } })}</div></div>`
      : `<div class="fact row-flex" style="gap:10px;flex-wrap:nowrap;align-items:flex-start">${I('zap', 'i35')}<p class="small" style="color:var(--ink-2)">Ao aprovar, ${after}</p></div>
        <div class="row-flex m-stack" style="justify-content:flex-end">${A('Pedir ajuste', 'adj', { v: 'secondary', data: { id: sel.id } })}${A('Aprovar', 'approve', { v: 'primary', size: 'md', icon: 'check', data: { id: sel.id } })}</div>`}
    </section>`;
  } else if (S.coordTab === 'pend') detail = `<section class="card">${empty('circle-check', 'Tudo em dia', 'Nenhum documento para analisar. Quando um aluno enviar, ele aparece aqui.')}</section>`;
  else detail = `<section class="card">${empty('inbox', 'Histórico', 'As solicitações analisadas ficam aqui. Toque em Para analisar para voltar à fila.')}</section>`;
  return shell({ persona: 'coord', title: 'Documentos', content: `<div class="stack">
    <div class="page-head"><div><h1 class="page-title">Documentos para analisar</h1><p class="page-desc">Confira o documento e aprove. O sistema faz o resto: lança no Lyceum, cria as atividades ou o estudo dirigido e avisa o aluno.</p></div></div>
    <div>${`<div class="seg-track" role="tablist" data-seg="coord"><span class="seg-pill" data-keep></span>${[['pend', 'Para analisar', pend.length], ['done', 'Analisados', done.length]].map(([k, l, n]) => `<button role="tab" class="seg-btn ${S.coordTab === k ? 'active' : ''}" data-a="coord-tab" data-t="${k}">${l}<span class="seg-count">${n}</span></button>`).join('')}</div>`}</div>
    <div class="coord-grid"><section class="card flush"><div class="divide">${list.length ? list.map((r, ix) => item(r, ix)).join('') : `<div class="small" style="padding:24px 20px">${S.coordTab === 'pend' ? 'Nenhum documento na fila.' : 'Nenhuma solicitação analisada ainda.'}</div>`}</div></section><div>${detail}</div></div></div>` });
}

/* ---------- Professor ---------- */
function profItems(p) {
  const pub = [], ev = [], wait = [], hist = [];
  S.reqs.forEach(r => (r.disc || []).forEach((d, i) => {
    if (d.prof !== p || d.st === 'ed') return;
    const it = { r, d, i };
    if (d.st === 'aguardando') pub.push(it); else if (d.st === 'entregue') ev.push(it); else if (d.st === 'publicada' || d.st === 'refazer') wait.push(it); else hist.push(it);
  }));
  return { pub, eval: ev, wait, hist };
}
function profView() {
  const { pub, eval: ev, wait, hist } = profItems(S.prof);
  const row = ({ r, d, i }, kind, j = 0) => { const st = STUD[r.sid];
    const info = kind === 'pub' ? `Afastamento ${periodo(r)} · entrega até <span class="mono">${fmt(d.prazo || addDays(r.fim, 15))}</span>` : kind === 'eval' ? `Entregue em <span class="mono">${fmt(d.entAt)}</span> · ${d.tent === 2 ? 'segunda chance' : 'primeira entrega'}` : kind === 'wait' ? `Publicada · o aluno entrega até <span class="mono">${fmt(d.st === 'refazer' ? d.prazo2 : d.prazo)}</span>` : (d.st === 'aceita' ? 'Aceita' : 'Não aceita') + ` em <span class="mono">${fmt(d.evalAt)}</span>`;
    const act = kind === 'pub' ? A('Publicar atividade', 'pub-open', { v: 'secondary', size: 'sm', data: { r: r.id, d: i } }) : kind === 'eval' ? A('Avaliar', 'eval-open', { v: 'secondary', size: 'sm', data: { r: r.id, d: i } }) : '';
    return `<div class="drow" style="--i:${j}"><div class="drow-main"><p class="row-title">${st.nome}</p><p class="row-sub"><span>${d.nome}</span><span>·</span><span class="mono">${d.cod}</span></p><p class="small" style="margin-top:6px">${info}</p></div>${act ? `<div class="drow-act">${act}</div>` : ''}</div>`; };
  const sec = (title, sub, items, kind, emptyMsg) => `<section class="card flush"><div class="list-top"><span style="color:var(--ink);font-weight:600;font-size:12px">${title}</span><span><span class="mono">${items.length}</span> ${sub}</span></div>${items.length ? `<div class="divide">${items.map((x, j) => row(x, kind, j)).join('')}</div>` : `<p class="small" style="padding:18px 20px">${emptyMsg}</p>`}</section>`;
  return shell({ persona: 'prof', title: 'Atividades', content: `<div class="narrow stack" style="max-width:820px">
    <div class="between m-stack" style="align-items:flex-end;gap:12px"><div><h1 class="page-title">Atividades de compensação</h1><p class="page-desc">Publique uma atividade e avalie a entrega. Prazo, lembretes e avisos ao aluno são automáticos.</p></div></div>
    <div class="stack-sm"><p class="tiny">Ver como:</p><div class="seg-track" role="tablist" data-seg="prof" style="max-width:100%;overflow-x:auto"><span class="seg-pill" data-keep></span>${Object.entries(PROFS).map(([k, n]) => `<button role="tab" class="seg-btn ${S.prof === k ? 'active' : ''}" data-a="prof-sel" data-p="${k}">${n}</button>`).join('')}</div></div>
    ${!pub.length && !ev.length && !wait.length && !hist.length ? `<section class="card">${empty('clipboard-list', 'Nenhuma atividade por enquanto', 'Quando a coordenação aprovar um afastamento de 15 a 39 dias de um aluno seu, a atividade para publicar aparece aqui e você recebe um e-mail.')}</section>` : `
    ${sec('Para publicar', 'pendentes', pub, 'pub', 'Nenhuma atividade para publicar.')}
    ${sec('Para avaliar', 'entregas', ev, 'eval', 'Nenhuma entrega para avaliar.')}
    ${wait.length ? sec('Aguardando o aluno', 'publicadas', wait, 'wait', '') : ''}
    ${hist.length ? sec('Concluídas', 'avaliadas', hist, 'hist', '') : ''}`}</div>` });
}
function pubModal(rid, i) {
  const r = S.reqs.find(x => x.id === +rid), d = r.disc[i], st = STUD[r.sid];
  return `<div class="scrim" data-scrim><div class="modal md" role="dialog" aria-modal="true" aria-labelledby="pm-t">
    <header class="modal-head"><div><h2 class="modal-title" id="pm-t">Publicar atividade</h2><p class="modal-sub">${d.nome} · ${st.nome}</p></div><button class="close" data-a="close-modal" aria-label="Fechar">${I('x')}</button></header>
    <div class="modal-body stack" style="padding:20px">
      ${dl([['Aluno', st.nome], ['Afastamento', periodo(r)], ['Prazo de entrega', `<span class="mono">${fmt(addDays(r.fim, 15))}</span> <span class="tiny">automático</span>`]], 3)}
      ${field('O que o aluno deve fazer', `<textarea class="control" rows="5" id="pub-txt" placeholder="Ex.: Resolva os exercícios 1 a 5 do capítulo 3 e envie um único arquivo com as respostas."></textarea>`, { required: true, help: 'Uma atividade que cubra o conteúdo do período de afastamento.' })}
      <div><input type="file" id="f-pub" hidden data-in="pubfile"><div id="pub-file">${S.pubFile ? `<div class="file" style="background:var(--surface-2)">${I('paperclip', 'i35')}<span class="file-name">${esc(S.pubFile)}</span></div>` : `<button class="link-btn" data-a="pick" data-target="f-pub">${I('paperclip', 'i35')}Anexar material (opcional)</button>`}</div></div>
    </div>
    <footer class="modal-foot"><span class="left tiny">O aluno recebe um aviso no aplicativo e por e-mail.</span>${A('Cancelar', 'close-modal', { v: 'ghost' })}${A('Publicar', 'pub-send', { v: 'primary', icon: 'send', data: { r: rid, d: i } })}</footer></div></div>`;
}
function evalModal(rid, i) {
  const r = S.reqs.find(x => x.id === +rid), d = r.disc[i], st = STUD[r.sid], second = d.tent === 2;
  return `<div class="scrim" data-scrim><div class="modal md" role="dialog" aria-modal="true" aria-labelledby="vm-t">
    <header class="modal-head"><div><h2 class="modal-title" id="vm-t">Avaliar entrega</h2><p class="modal-sub">${d.nome} · ${st.nome} · ${second ? 'segunda chance' : 'primeira entrega'}</p></div><button class="close" data-a="close-modal" aria-label="Fechar">${I('x')}</button></header>
    <div class="modal-body stack" style="padding:20px">
      <div><p class="section-label">Atividade publicada</p><div class="quote" style="margin-top:10px">${esc(d.enunciado)}</div></div>
      <div><p class="section-label">Entrega do aluno</p><div class="file" style="background:var(--surface-2);margin-top:10px">${I('file-text', 'i35')}<span class="file-name">${esc(d.arquivo)}</span>${A('Abrir', 'doc-open', { v: 'on-inset', size: 'xs', icon: 'external-link', data: { f: esc(d.arquivo) } })}</div></div>
      ${field('Comentário para o aluno', `<textarea class="control" rows="3" id="eval-txt" placeholder="${second ? 'Obrigatório se não aceitar' : 'Obrigatório para pedir ajuste: diga o que corrigir'}"></textarea>`)}
      <p class="tiny" id="eval-err" style="color:var(--crit-ink);font-weight:500" hidden>Escreva o comentário para o aluno.</p>
      <p class="tiny">${second ? 'Esta é a segunda chance. Se não aceitar, as faltas desta disciplina continuam registradas.' : 'Se pedir ajuste, o aluno ganha uma segunda chance, com novo prazo de 7 dias, automaticamente.'}</p>
    </div>
    <footer class="modal-foot">${A(second ? 'Não aceitar' : 'Pedir ajuste', 'eval-no', { v: 'ghost', data: { r: rid, d: i } })}${A('Aceitar', 'eval-yes', { v: 'primary', icon: 'check', data: { r: rid, d: i } })}</footer></div></div>`;
}
function docModal(f) {
  return `<div class="scrim" data-scrim><div class="modal md" role="dialog" aria-modal="true" aria-label="Documento"><header class="modal-head"><div><h2 class="modal-title">${esc(f)}</h2><p class="modal-sub">Pré-visualização de demonstração</p></div><button class="close" data-a="close-modal" aria-label="Fechar">${I('x')}</button></header>
    <div class="modal-body" style="padding:20px"><div class="doc-prev"><div class="doc-line w60"></div><div class="doc-line w40"></div><div class="doc-line"></div><div class="doc-line"></div><div class="doc-line w80"></div><div class="doc-line w30" style="margin-top:28px"></div></div></div>
    <footer class="modal-foot">${A('Fechar', 'close-modal', { v: 'secondary' })}</footer></div></div>`;
}

/* ---------- Render ---------- */
function demoBar() {
  return `<div class="demo-bar"><span class="demo-l">Demonstração</span><div class="demo-tabs" data-seg="demo"><span class="seg-pill" data-keep></span>${SCEN.map(([k, l]) => `<button class="demo-tab ${S.view === k ? 'on' : ''}" data-a="view" data-v="${k}">${l}</button>`).join('')}</div><button class="demo-reset" data-a="reset">${I('rotate-ccw', 'i35')}Reiniciar</button></div>`;
}
/* Render com diff de DOM: o que não mudou fica no lugar (a logo não recarrega, o foco
   não se perde, transições de cor e largura rodam). Tela nova entra com pageVariants;
   overlay sai mais rápido do que entra. */
function morph(from, to) {
  const a = [...from.childNodes], b = [...to.childNodes];
  b.forEach((n, i) => {
    const o = a[i];
    if (!o) { from.appendChild(n); return; }
    if (o.nodeType !== n.nodeType || (o.nodeType === 1 && o.tagName !== n.tagName)) { from.replaceChild(n, o); return; }
    if (o.nodeType !== 1) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    if (o.hasAttribute('data-keep')) return;
    for (const at of [...o.attributes]) if (!n.hasAttribute(at.name)) o.removeAttribute(at.name);
    for (const at of [...n.attributes]) if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value);
    if (o.tagName === 'INPUT') { if (o.type === 'checkbox') o.checked = n.hasAttribute('checked'); else if (o.type !== 'file' && document.activeElement !== o) o.value = n.getAttribute('value') || ''; }
    if (o.tagName === 'TEXTAREA') return;
    morph(o, n);
  });
  for (let i = a.length - 1; i >= b.length; i--) from.removeChild(a[i]);
}
let lastKey = null, hadModal = false;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function placePills() {
  document.querySelectorAll('[data-seg]').forEach(tr => {
    const p = tr.querySelector(':scope > .seg-pill'), act = tr.querySelector(':scope > .active, :scope > .on');
    if (!p) return;
    if (!act) { p.style.opacity = 0; return; }
    const fresh = !p.dataset.ready;
    if (fresh) p.style.transition = 'none';
    p.style.opacity = 1; p.style.width = act.offsetWidth + 'px'; p.style.height = act.offsetHeight + 'px';
    p.style.transform = `translate(${act.offsetLeft}px, ${act.offsetTop}px)`;
    if (fresh) { p.offsetWidth; p.dataset.ready = 1; requestAnimationFrame(() => { p.style.transition = ''; }); }
  });
}
function render() {
  let html, kind = S.view;
  if (S.view === 'coord') html = coordView();
  else if (S.view === 'prof') html = profView();
  else {
    const sid = S.view, r = reqOf(sid), form = !r || r.editing;
    kind += form ? ':form' : ':track';
    html = shell({ persona: 'aluno', title: form ? 'Enviar documento' : 'Minha solicitação', content: form ? alunoForm(sid) : alunoTrack(sid, r) });
    if (!S.avisoSeen[sid] && !S.modal) S.modal = { k: 'aviso' };
  }
  let modal = '';
  if (S.modal) {
    const m = S.modal;
    modal = m.k === 'aviso' ? avisoModal() : m.k === 'entrega' ? entregaModal(S.view, m.d) : m.k === 'pub' ? pubModal(m.r, m.d) : m.k === 'eval' ? evalModal(m.r, m.d) : m.k === 'doc' ? docModal(m.f) : m.k === 'ed' ? edModal() : '';
  }
  const root = document.getElementById('root');
  const old = root.querySelector(':scope > .scrim');
  const swap = old && modal && old.getAttribute('data-mk') !== (S.modal && S.modal.k + (S.modal.d ?? '') + (S.modal.r ?? ''));
  if (old && (!modal || swap) && !reduced) { document.body.appendChild(old); old.classList.add('leaving'); setTimeout(() => old.remove(), 160); }
  else if (old && (!modal || swap)) old.remove();
  const tpl = document.createElement('div');
  tpl.innerHTML = demoBar() + html + (modal ? modal.replace('<div class="scrim"', `<div class="scrim" data-mk="${S.modal.k + (S.modal.d ?? '') + (S.modal.r ?? '')}"`) : '');
  const viewChanged = kind.split(':')[0] !== (lastKey || '').split(':')[0];
  morph(root, tpl);
  if (kind !== lastKey) {
    const c = root.querySelector('main .container');
    if (c && !reduced) { c.classList.remove('page-enter'); c.offsetWidth; c.classList.add('page-enter'); }
    if (viewChanged && lastKey) window.scrollTo({ top: 0 });
    lastKey = kind;
  }
  hadModal = !!modal;
  document.body.classList.toggle('has-overlay', !!modal);
  placePills();
  save();
}
window.addEventListener('resize', () => placePills());

/* ---------- Ações ---------- */
const ACT = {
  noop() {},
  view(t) { S.view = t.dataset.v; S.modal = null; S.bell = false; S.coordAdj = null; },
  reset() { S = fresh(); toast('Demonstração reiniciada', 'Todos os cenários voltaram ao início.'); },
  tipo(t) { draftOf(S.view).tipo = t.dataset.t; },
  example() { const d = draftOf(S.view); [d.ini, d.fim] = STUD[S.view].ex; },
  pick(t) { document.getElementById(t.dataset.target).click(); return 'skip'; },
  'rm-file'(t) { draftOf(S.view).files.splice(+t.dataset.i, 1); },
  'show-msg'() { draftOf(S.view).showMsg = true; },
  submit() {
    const sid = S.view, d = draftOf(sid), old = reqOf(sid);
    const msgEl = document.querySelector('[data-in="msg"]'); if (msgEl) d.msg = msgEl.value;
    if (old && old.editing) { Object.assign(old, { tipo: d.tipo, ini: d.ini, fim: d.fim, files: [...d.files], msg: d.msg, status: 'analise', editing: false, sent: iso(TODAY), motivo: '', obs: '', decided: null }); }
    else S.reqs.push({ id: S.nextId++, sid, tipo: d.tipo, ini: d.ini, fim: d.fim, files: [...d.files], msg: d.msg, status: 'analise', sent: iso(TODAY) });
    const r = reqOf(sid);
    notify(sid, 'Recebemos seu documento', `Solicitação #${r.id}. A coordenação vai conferir. Não precisa voltar ao sistema: avisamos a cada etapa.`);
    delete S.drafts[sid];
    toast('Documento enviado', 'Agora ele aparece para a coordenação. Abra o cenário Coordenação para aprovar.');
  },
  'aviso-ok'() { if (S.view.startsWith('s')) S.avisoSeen[S.view] = true; S.modal = null; },
  'open-aviso'() { S.modal = { k: 'aviso' }; },
  'open-ed'() { S.modal = { k: 'ed' }; },
  bell() { S.bell = !S.bell; if (!S.bell) S.notices[S.view].forEach(n => n.read = true); },
  resend() { const r = reqOf(S.view); r.editing = true; S.drafts[S.view] = { tipo: r.tipo, ini: r.ini, fim: r.fim, files: [], agree: false, msg: r.msg || '', showMsg: !!r.msg }; },
  'act-open'(t) { S.actFile = null; S.modal = { k: 'entrega', d: +t.dataset.d }; },
  'act-send'(t) {
    const r = reqOf(S.view), d = r.disc[+t.dataset.d];
    Object.assign(d, { st: 'entregue', arquivo: S.actFile, entAt: iso(TODAY) }); S.actFile = null; S.modal = null;
    notify(S.view, 'Entrega recebida', `${d.nome}: o professor vai avaliar.`);
    toast('Atividade enviada', `${d.nome}. Agora ela aparece para ${PROFS[d.prof]} avaliar no cenário Professor.`);
  },
  'close-modal'() { S.modal = null; S.actFile = null; S.pubFile = null; },
  'doc-open'(t) { S.modal = { k: 'doc', f: t.dataset.f, back: S.modal }; },
  'coord-tab'(t) { S.coordTab = t.dataset.t; S.coordAdj = null; S.coordSel = null; },
  'coord-sel'(t) { S.coordSel = +t.dataset.id; S.coordAdj = null; },
  approve(t) {
    const r = S.reqs.find(x => x.id === +t.dataset.id), st = STUD[r.sid], mod = modOf(daysBetween(r.ini, r.fim));
    r.decided = iso(TODAY);
    if (mod === 'auto') { r.status = 'compensada'; notify(r.sid, 'Faltas removidas', `Suas faltas de ${fmt(r.ini)} a ${fmt(r.fim)} foram removidas em todas as disciplinas. Não há nada para fazer.`); }
    if (mod === 'ativ') { r.status = 'aprovada'; r.disc = st.disc.map(([nome, cod, prof, freq]) => ({ nome, cod, prof, freq, st: 'aguardando', prazo: addDays(r.fim, 15) })); notify(r.sid, 'Documento aprovado', `Você fará uma atividade por disciplina. Cada uma chega pelo aplicativo e por e-mail. Prazo: ${fmt(addDays(r.fim, 15))}.`); }
    if (mod === 'ed') { r.status = 'aprovada'; r.disc = st.disc.map(([nome, cod, prof, freq]) => ({ nome, cod, prof, freq, st: 'ed' })); notify(r.sid, 'Documento aprovado', 'Suas disciplinas já estão no estudo dirigido, sem custo. As datas aparecem no AVA.'); }
    S.coordSel = null;
    toast('Aprovado', { auto: 'Faltas removidas e aluno avisado.', ativ: 'Atividades criadas para os professores e aluno avisado.', ed: 'Disciplinas no estudo dirigido e aluno avisado.' }[mod]);
  },
  adj(t) { S.coordAdj = +t.dataset.id; S.coordMotivo = null; S.coordObs = ''; },
  motivo(t) { const obs = document.getElementById('adj-obs'); S.coordObs = obs ? obs.value : ''; S.coordMotivo = t.dataset.m; },
  'adj-cancel'() { S.coordAdj = null; },
  'adj-send'(t) {
    const r = S.reqs.find(x => x.id === +t.dataset.id), obs = document.getElementById('adj-obs');
    Object.assign(r, { status: 'ajuste', motivo: S.coordMotivo, obs: obs ? obs.value : '', decided: iso(TODAY) });
    notify(r.sid, 'Precisamos de um ajuste', `${S.coordMotivo}. Corrija e envie de novo em menos de um minuto.`);
    S.coordAdj = null; S.coordSel = null; toast('Ajuste pedido', 'O aluno recebe o motivo e reenvia pelo mesmo protocolo.');
  },
  'prof-sel'(t) { S.prof = t.dataset.p; },
  'pub-open'(t) { S.pubFile = null; S.modal = { k: 'pub', r: t.dataset.r, d: +t.dataset.d }; },
  'pub-send'(t) {
    const txt = document.getElementById('pub-txt').value.trim();
    if (!txt) { document.getElementById('pub-txt').focus(); document.getElementById('pub-txt').style.boxShadow = '0 0 0 2px var(--crit)'; return 'skip'; }
    const r = S.reqs.find(x => x.id === +t.dataset.r), d = r.disc[+t.dataset.d];
    Object.assign(d, { st: 'publicada', enunciado: txt, anexo: S.pubFile, prazo: addDays(r.fim, 15), tent: 1, pubAt: iso(TODAY) }); S.pubFile = null; S.modal = null;
    notify(r.sid, 'Nova atividade para você', `${d.nome}. Entrega até ${fmt(d.prazo)} às 23h59.`);
    toast('Atividade publicada', `${STUD[r.sid].first} foi avisado. Prazo: ${fmt(d.prazo)}.`);
  },
  'eval-open'(t) { S.modal = { k: 'eval', r: t.dataset.r, d: +t.dataset.d }; },
  'eval-yes'(t) {
    const r = S.reqs.find(x => x.id === +t.dataset.r), d = r.disc[+t.dataset.d];
    Object.assign(d, { st: 'aceita', evalAt: iso(TODAY), comentario: document.getElementById('eval-txt').value });
    notify(r.sid, 'Atividade aceita', `${d.nome}: faltas compensadas.`);
    finishIfDone(r); S.modal = null; toast('Atividade aceita', `Faltas de ${d.nome} compensadas no Lyceum.`);
  },
  'eval-no'(t) {
    const txt = document.getElementById('eval-txt').value.trim();
    if (!txt) { document.getElementById('eval-err').hidden = false; document.getElementById('eval-txt').focus(); return 'skip'; }
    const r = S.reqs.find(x => x.id === +t.dataset.r), d = r.disc[+t.dataset.d];
    if (d.tent === 1) { Object.assign(d, { st: 'refazer', devolutiva: txt, prazo2: addDays(iso(TODAY), 7), tent: 2, evalAt: iso(TODAY) }); notify(r.sid, 'Você tem uma segunda chance', `${d.nome}: veja o que ajustar. Novo prazo: ${fmt(d.prazo2)}.`); toast('Ajuste pedido', `Segunda chance com prazo até ${fmt(d.prazo2)}.`); }
    else { Object.assign(d, { st: 'recusada', devolutiva: txt, evalAt: iso(TODAY) }); notify(r.sid, 'Atividade não aceita', `${d.nome}: as faltas continuam registradas.`); finishIfDone(r); toast('Entrega não aceita', 'O aluno foi avisado.'); }
    S.modal = null;
  },
};
function finishIfDone(r) {
  if (!r.disc.every(d => d.st === 'aceita' || d.st === 'recusada')) return;
  r.status = r.disc.every(d => d.st === 'aceita') ? 'compensada' : 'concluida';
  notify(r.sid, r.status === 'compensada' ? 'Pronto: faltas compensadas' : 'Compensação encerrada', r.status === 'compensada' ? 'Todas as atividades foram aceitas. Suas faltas do período estão compensadas.' : 'Veja o resultado de cada disciplina.');
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]');
  if (!t) { if (S.bell && !e.target.closest('.pop')) { S.bell = false; S.notices[S.view] && S.notices[S.view].forEach(n => n.read = true); render(); } return; }
  if (t.disabled) return;
  const fn = ACT[t.dataset.a]; if (!fn) return;
  e.preventDefault();
  if (t.dataset.a === 'doc-open') { const back = S.modal; ACT['doc-open'](t); S.modal.back = back; render(); return; }
  if (t.dataset.a === 'close-modal' && S.modal && S.modal.back) { S.modal = S.modal.back; render(); return; }
  if (fn(t) !== 'skip') render();
});
document.addEventListener('mousedown', e => { if (e.target.matches('[data-scrim]')) { if (S.modal && S.modal.k === 'aviso') ACT['aviso-ok'](); else if (S.modal && S.modal.back) S.modal = S.modal.back; else ACT['close-modal'](); render(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) { if (S.modal.k === 'aviso') ACT['aviso-ok'](); else if (S.modal.back) S.modal = S.modal.back; else ACT['close-modal'](); render(); } });
document.addEventListener('change', e => {
  const k = e.target.dataset.in; if (!k) return;
  if (k === 'ini' || k === 'fim') { draftOf(S.view)[k] = e.target.value; render(); }
  if (k === 'agree') { draftOf(S.view).agree = e.target.checked; render(); }
  if (k === 'files') { draftOf(S.view).files.push(...[...e.target.files].map(f => f.name)); render(); }
  if (k === 'actfile' && e.target.files[0]) { S.actFile = e.target.files[0].name; render(); }
  if (k === 'pubfile' && e.target.files[0]) { const txt = document.getElementById('pub-txt').value; S.pubFile = e.target.files[0].name; render(); document.getElementById('pub-txt').value = txt; }
});
document.addEventListener('input', e => { if (e.target.dataset.in === 'msg') draftOf(S.view).msg = e.target.value; });
render();
