// Bodegón Núñez · intro, navegación, WOW "¿Para cuántos?", carta, salón, promos y sedes
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const H = document.documentElement;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kitListo = new Promise(r => { if (window.KIT) r(window.KIT); else window.addEventListener('bn:kit', () => r(window.KIT), { once: true }); });
const reservar = (op = {}) => kitListo.then(k => k.reservas.abrir(op));

/* ---------- plato de la carta (template del kit) ---------- */
window.BN_PLATO = (p, ctx) => {
  const precio = ctx.money(p.precio);
  const casa = (p.etiquetas || []).includes('casa');
  const tags = (p.etiquetas || []).filter(t => t !== 'casa').map(t => ctx.etiquetaHTML(t)).join('');
  const thumb = p.foto ? p.foto.replace('.webp', '-t.webp') : '';
  return `<div class="plato${p.foto ? ' con-foto' : ''}${casa ? ' es-casa' : ''}" data-foto="${esc(p.foto ? ctx.asset(p.foto) : '')}" data-nombre="${esc(p.nombre)}" data-desc="${esc(p.descripcion || '')}">
    ${p.foto ? `<img class="plato__mini" src="${esc(ctx.asset(thumb))}" width="64" height="64" alt="" loading="lazy" decoding="async">` : ''}
    <h3 class="plato__n">${esc(p.nombre)}${tags}</h3>
    <span class="plato__p${precio ? '' : ' na'}">${precio ? esc(precio) : 'Consultar'}</span>
    ${p.descripcion ? `<p class="plato__d">${esc(p.descripcion)}</p>` : ''}
  </div>`;
};

/* ---------- intro: el cartel cae, rebota y se acomoda en el hero ---------- */
(function intro() {
  const con = H.classList.contains('con-intro');
  const heroImg = $('[data-hero-img]');
  const esperar = Promise.race([
    Promise.all([document.fonts ? document.fonts.ready : 0, heroImg && !heroImg.complete ? new Promise(r => { heroImg.onload = heroImg.onerror = r; }) : 0]),
    new Promise(r => setTimeout(r, 900)),
  ]);
  if (!con) { H.classList.add('listo', 'abierto'); return; }
  const t0 = performance.now();
  esperar.then(() => {
    const falta = Math.max(0, 1050 - (performance.now() - t0));
    setTimeout(() => {
      const intro = $('.intro'), ci = $('.intro .cartel-i'), destino = $('.hA .cartel');
      if (intro && ci && destino) {
        const a = ci.getBoundingClientRect(), b = destino.getBoundingClientRect();
        intro.classList.add('se-va');
        ci.style.animation = 'none';
        ci.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})`;
      }
      H.classList.add('listo');
      setTimeout(() => { H.classList.add('abierto'); H.classList.remove('con-intro'); intro?.remove(); }, 620);
    }, falta);
  });
})();

/* ---------- barra que aparece pasada la primera pantalla + píldora del panel ---------- */
const hero = $('.hero');
if (hero) new IntersectionObserver(([e]) => H.classList.toggle('nav-on', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
const ocultanPill = new Set();
const ioPill = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? ocultanPill.add(e.target) : ocultanPill.delete(e.target)); H.classList.toggle('pill-off', ocultanPill.size > 0); }, { threshold: .1 });
[hero, $('.mym'), $('.cuantos')].forEach(el => el && ioPill.observe(el));

/* ---------- fotos que se piden recién cerca de la pantalla ---------- */
const ioSrc = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const i = e.target; i.src = i.dataset.src; i.removeAttribute('data-src'); ioSrc.unobserve(i); }), { rootMargin: '600px 0px' });
$$('img[data-src]').forEach(i => ioSrc.observe(i));

/* ---------- entradas al scrollear ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: .18 });
$$('.rv').forEach(el => io.observe(el));

/* ---------- WOW: la Mila-grosa ---------- */
const RINDE = 4; // carta: "Mila-grosa: 2 gustos a elección (comen 4 personas)"
const GUSTOS = {
  napolitana: ['Napolitana', 'Salsa fileto y muzzarella. El clásico que nunca falla.'],
  granbodegon: ['Gran Bodegón', 'Nuestro emblema: fileto, muzzarella, 3 huevos fritos, salsa picante y alioli.'],
  gringa: ['Gringa', 'Cheddar fundido, panceta, 3 huevos fritos y salsa barbacoa.'],
  provolone: ['Provolone', 'Salsa fileto, muzzarella y queso provolone.'],
  calabresa: ['Calabresa', 'Salsa fileto, longaniza y muzzarella.'],
  scalonesa: ['La Scalonesa', 'La mila del Mundial: huevos, chorizo crocante, morrón y provoleta. Edición limitada.'],
  sola: ['Sola', 'La que no necesita nada más. Con fritas, ensalada o puré.'],
};
const PRECIO = { sola: 55000, napolitana: 65000, granbodegon: 68000, gringa: 68000, provolone: 68000 };
const pesos = (n) => '$' + n.toLocaleString('es-AR');
const pesoFoto = (img, k) => img && img.setAttribute('href', `img/top/top-${k}.webp`);
const golpe = (el) => { if (!el) return; el.classList.remove('pum'); void el.getBoundingClientRect(); el.classList.add('pum'); };
// las fotos grandes de los gustos se cargan cuando la sección está cerca (no compiten con el hero)
function cuandoCerca(el, fn) { new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); setTimeout(fn, H.classList.contains('abierto') ? 0 : 2200); }, { rootMargin: '300px' }).observe(el); }

/* ---------- 1 · Mitad y mitad ---------- */
const mym = $('.mym');
let pedidoMila = '';
if (mym) {
  const st = { modo: 'mitad', a: 'napolitana', b: 'granbodegon' };
  let cerca = false;
  cuandoCerca(mym, () => { cerca = true; pintar(); Object.keys(GUSTOS).forEach(k => { const i = new Image(); i.src = `img/top/top-${k}.webp`; }); });
  $$('[data-modo]', mym).forEach(b => b.addEventListener('click', () => { st.modo = b.dataset.modo; if (st.modo === 'entera') st.b = st.a; pintar(); }));
  $$('.lista button', mym).forEach(b => b.addEventListener('click', () => {
    const lado = b.dataset.lado;
    if (st.modo === 'entera') { st.a = st.b = b.dataset.g; pintar('ab'); }
    else { st[lado] = b.dataset.g; pintar(lado); }
  }));
  function pintar(cambio) {
    mym.classList.toggle('es-entera', st.modo === 'entera');
    $$('[data-modo]', mym).forEach(b => b.setAttribute('aria-pressed', b.dataset.modo === st.modo));
    $$('.lista button', mym).forEach(b => b.setAttribute('aria-pressed', b.dataset.g === st[b.dataset.lado]));
    if (cerca) { pesoFoto($('#imgA', mym), st.a); pesoFoto($('#imgB', mym), st.b); }
    if (cambio) $$('.mitad', mym).forEach(m => { if (cambio.includes(m.dataset.lado)) golpe(m); });
    const [na, da] = GUSTOS[st.a], [nb] = GUSTOS[st.b];
    const misma = st.a === st.b;
    $('[data-combo]', mym).textContent = misma ? `Milanesa ${na}, entera` : `Mila-grosa ${na} + ${nb}`;
    $('[data-combo-d]', mym).textContent = misma ? da : `Mitad ${na.toLowerCase()}, mitad ${nb.toLowerCase()}. Con fritas, ensalada o puré.`;
    $('[data-precio]', mym).textContent = misma && PRECIO[st.a] ? pesos(PRECIO[st.a]) : 'Consultar';
    pedidoMila = misma ? `Queremos la milanesa ${na} entera.` : `Queremos la Mila-grosa mitad ${na} / mitad ${nb}.`;
  }
  pintar();
  $('[data-pedir-mila]', mym).addEventListener('click', () => reservar({ personas: 4 }).then(() => setTimeout(() => {
    const t = $('.kit-pop textarea[name="comentario"]'); if (t) { t.value = pedidoMila; t.dispatchEvent(new Event('input', { bubbles: true })); }
  }, 60)));
}

/* ---------- 2 · ¿Para cuántos? ---------- */
const cu = $('.cuantos');
if (cu) {
  const st = { n: 6 };
  const mesa = $('.mesa', cu), sello = $('.sello', cu), xm = $('.xmilas', cu);
  const sillas = [];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('button');
    b.className = 'silla'; b.type = 'button';
    b.setAttribute('aria-label', `Somos ${i + 1}`);
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11"/></svg>';
    b.addEventListener('click', () => { st.n = i + 1; pintar(true); });
    mesa.appendChild(b); sillas.push(b);
  }
  const ubicar = () => { const c = mesa.clientWidth / 2, r = c - 22; sillas.forEach((b, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI * 2; b.style.left = c + r * Math.cos(a) + 'px'; b.style.top = c + r * Math.sin(a) + 'px'; }); };
  ubicar(); addEventListener('resize', ubicar);
  cuandoCerca(cu, () => { pesoFoto($('#imgC', cu), 'napolitana'); pesoFoto($('#imgD', cu), 'gringa'); });
  $('[data-menos]', cu).addEventListener('click', () => { st.n = Math.max(1, st.n - 1); pintar(true); });
  $('[data-mas]', cu).addEventListener('click', () => { st.n = Math.min(12, st.n + 1); pintar(true); });

  // qué recomienda la casa según cuántos son
  function receta(n) {
    const r = [];
    if (n === 1) r.push({ c: 1, t: 'Milanesa individual', d: 'Con fritas, ensalada o puré', p: 26000, desde: true });
    else {
      const g = n === 2 ? 1 : Math.ceil(n / RINDE);
      r.push({ c: g, t: g === 1 ? 'Milanesa gigante' : 'Milanesas gigantes', d: n === 2 ? 'Para los dos, y lo que sobra se lo llevan' : g > 1 ? 'Pidan una mitad y mitad: prueban más gustos' : 'Entera o mitad y mitad', p: 55000, desde: true, link: true });
    }
    if (n >= 3 && n < 6) r.push({ c: 1, t: 'Papas Bodegón', d: 'Crema de verdeo, panceta y alioli, al centro', p: 14000 });
    if (n >= 6) { const k = n >= 10 ? 2 : 1; r.push({ c: k, t: k > 1 ? 'Picadas Bodegón' : 'Picada Bodegón', d: 'Rabas, albóndigas, buñuelos y más, para arrancar', p: 53000 }); }
    return r;
  }
  function pintar(g) {
    const n = st.n, r = receta(n);
    sillas.forEach((b, i) => b.classList.toggle('on', i < n));
    $('b', sello).textContent = n; $('small', sello).textContent = n === 1 ? 'persona' : 'personas';
    if (g) golpe(sello);
    const gig = r[0].t.startsWith('Milanesa') && n > 1 ? r[0].c : 0;
    xm.textContent = '×' + gig; xm.classList.toggle('on', gig > 1);
    $('.t-l', cu).innerHTML = r.map(x => `<li><b>${x.c}</b><div><strong>${x.t}</strong><small>${x.d}${x.link ? ' · <a href="#mila">armala ↑</a>' : ''}</small></div><span>${x.desde ? 'desde ' : ''}${pesos(x.p * x.c)}</span></li>`).join('');
    const total = r.reduce((s, x) => s + x.p * x.c, 0);
    $('[data-total]', cu).textContent = 'desde ' + pesos(total);
    $('[data-pp]', cu).textContent = n > 1 ? `Unos ${pesos(Math.round(total / n / 500) * 500)} por persona.` : '';
    $('.stepper span', cu).textContent = `${n} ${n === 1 ? 'persona' : 'personas'}`;
    const cta = $('[data-mesa-para]', cu); cta.textContent = `Reservar mesa para ${n}`; cta.dataset.n = n;
  }
  pintar();
}

/* ---------- botones que abren la reserva ---------- */
const proxDia = (dow) => { const d = new Date(); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7 || 7)); return iso(d); };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function tildarCumple() { const c = $('.kit-pop input[name="extra"][value="cumple"]'); if (c && !c.checked) { c.checked = true; c.dispatchEvent(new Event('input', { bubbles: true })); } }
function proxHabil() { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })); if (d.getHours() >= 14) d.setDate(d.getDate() + 1); while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1); return iso(d); }
function prox29() { const h = new Date(); h.setHours(0, 0, 0, 0); for (let i = 0; i < 70; i++) { const d = new Date(h); d.setDate(h.getDate() + i); if (d.getDate() === 29) return { d, dias: i }; } return null; }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-mesa-para],[data-mediodia],[data-jueves],[data-29],[data-reservar-sede],[data-ir-carta]');
  if (!b) return;
  if (b.matches('[data-mesa-para]')) return reservar({ personas: b.dataset.n, ...(b.dataset.n >= 6 ? { hora: '21:00' } : {}) }).then(() => { if (b.hasAttribute('data-cumple')) setTimeout(tildarCumple, 60); });
  if (b.matches('[data-mediodia]')) return reservar({ fecha: proxHabil(), hora: '13:00', personas: 2 });
  if (b.matches('[data-jueves]')) return reservar({ fecha: proxDia(4), hora: '21:00', personas: 6 });
  if (b.matches('[data-29]')) { const p = prox29(); return reservar({ fecha: p ? iso(p.d) : undefined, hora: '21:00', personas: 4 }); }
  if (b.matches('[data-reservar-sede]')) return reservar(sede === 'nunez' ? { hora: '21:15' } : { hora: '21:00' });
  if (b.matches('[data-ir-carta]')) { irCarta(b.dataset.irCarta); }
});

/* ---------- confirmación propia: mesa pedida + WhatsApp a la sede ---------- */
const SEDES = {
  palermo: { nombre: 'Palermo', dir: 'José A. Cabrera 4667', barrio: 'Palermo Soho · CABA', wa: '5491162200025', waTxt: '11 6220-0025',
    q: 'Bodeg%C3%B3n+N%C3%BA%C3%B1ez,+Jos%C3%A9+Antonio+Cabrera+4667,+CABA',
    horas: { lun: [['12:00', '15:30']], mar: [['12:00', '15:30'], ['20:00', '00:00']], mie: [['12:00', '15:30'], ['20:00', '00:00']], jue: [['12:00', '15:30'], ['20:00', '00:00']], vie: [['12:00', '15:30'], ['20:00', '01:00']], sab: [['12:00', '15:30'], ['20:00', '01:00']], dom: [['12:00', '15:30'], ['20:00', '00:00']] } },
  nunez: { nombre: 'Núñez', dir: 'Arribeños 3198', barrio: 'Esquina Campos Salles · Núñez', wa: '5491167480818', waTxt: '11 6748-0818',
    q: 'Bodeg%C3%B3n+N%C3%BA%C3%B1ez,+Arribe%C3%B1os+3198,+CABA',
    horas: { lun: [['12:00', '15:30'], ['20:00', '00:00']], mar: [['12:00', '15:30'], ['20:00', '00:00']], mie: [['12:00', '15:30'], ['20:00', '00:00']], jue: [['12:00', '15:30'], ['20:00', '00:00']], vie: [['12:00', '16:00'], ['20:00', '01:00']], sab: [['12:00', '16:00'], ['20:00', '01:00']], dom: [['12:00', '15:30'], ['20:00', '00:00']] } },
};
document.addEventListener('kit:reserva-lista', (e) => {
  e.preventDefault();
  const { reserva, resumen, el } = e.detail;
  const s = SEDES[String(reserva?.servicio || '').startsWith('nun') ? 'nunez' : 'palermo'];
  const txt = `Hola Bodegón Núñez ${s.nombre}! Pedí una mesa para ${resumen.personas} ${/^(hoy|mañana)/i.test(resumen.dia)?resumen.dia.toLowerCase():'el '+resumen.dia} a las ${resumen.hora}, a nombre de ${resumen.nombre}.${resumen.codigo ? ` Código ${resumen.codigo}.` : ''}`;
  el.innerHTML = `<div class="mesa-ok"><div class="sello-ok"><div><b>${esc(String(resumen.personas).split(' ')[0])}</b><small>personas</small></div></div>
    <h3>¡Mesa pedida!</h3><p>${esc(resumen.dia)} a las ${esc(resumen.hora)} en <b>${esc(s.nombre)}</b> (${esc(s.dir)}). Te confirmamos por WhatsApp.</p>
    <a class="etq" href="https://wa.me/${s.wa}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Avisar por WhatsApp</a></div>`;
});

/* ---------- carta: una sección por vez, Anterior / Siguiente y la foto del plato ---------- */
const cartaEl = $('#carta-kit');
const pasos = $('.carta-pasos');
const fotoBox = $('.carta-foto');
let cartaCats = [];
function catActual() { return $('.kit-tab.is-on', cartaEl)?.dataset.cat; }
function pintarPasos() {
  const tabs = $$('.kit-tab', cartaEl); const i = tabs.findIndex(t => t.classList.contains('is-on'));
  const [ant, sig] = $$('button', pasos);
  ant.disabled = i <= 0; sig.disabled = i < 0 || i >= tabs.length - 1;
  $('em', ant).textContent = tabs[i - 1]?.textContent || ''; $('em', sig).textContent = tabs[i + 1]?.textContent || '';
}
const MAX_PLATOS = 8;
function recortar() {
  $$('.kit-carta__panel', cartaEl).forEach(p => {
    $('.plato-mas', p)?.remove();
    const its = $$('.kit-item', p);
    const peso = (it) => { const pl = $('.plato', it); return (pl?.classList.contains('es-casa') ? 4 : 0) + (pl?.classList.contains('con-foto') ? 2 : 0) + ($('.plato__p.na', it) ? 0 : 1); };
    its.map((it, i) => ({ it, i, w: peso(it) })).sort((x, y) => y.w - x.w || x.i - y.i).forEach((o, k) => { o.it.classList.toggle('extra', k >= MAX_PLATOS); o.it.style.order = k; });
    p.style.display = 'flex'; p.style.flexDirection = 'column';
    const resto = its.length - Math.min(its.length, MAX_PLATOS);
    const id = p.id.replace(/^.*-p-/, ''); const c = cartaCats.find(x => x.id === id);
    p.insertAdjacentHTML('beforeend', `<a class="plato-mas" href="carta/" style="order:99">${resto > 0 ? `${resto} ${resto === 1 ? 'plato más' : 'platos más'} de ${esc((c?.nombre || '').toLowerCase())}` : `La carta completa`}<span>Ver carta →</span></a>`);
  });
  // todas las pestañas con el mismo alto: cambiar de sección no mueve la página
  cartaEl.style.setProperty('--panel-h', '0px');
  let max = 0;
  $$('.kit-carta__panel', cartaEl).forEach(p => { const h = p.hidden; p.hidden = false; max = Math.max(max, p.offsetHeight); p.hidden = h; });
  cartaEl.style.setProperty('--panel-h', max + 'px');
}
addEventListener('resize', () => { if (cartaEl) { clearTimeout(window.__rc); window.__rc = setTimeout(recortar, 200); } });
function cabeceras() {
  $$('.kit-carta__panel', cartaEl).forEach(p => {
    if ($('.sec-cab', p)) return;
    const id = p.id.replace(/^.*-p-/, ''); const c = cartaCats.find(x => x.id === id);
    const n = $$('.kit-item', p).length;
    p.insertAdjacentHTML('afterbegin', `<div class="sec-cab"><h3>${esc(c?.nombre || '')}</h3><small>${n} ${n === 1 ? 'opción' : 'opciones'}</small></div>`);
  });
}
let fotoIdx = 0;
function mostrarFoto(pl) {
  if (!fotoBox || !pl || getComputedStyle(fotoBox).display === 'none') return;
  const src = pl.dataset.foto; if (!src) return;
  const imgs = $$('img', fotoBox); const cur = imgs[fotoIdx];
  if (cur.getAttribute('src') === src && cur.classList.contains('on')) return;
  const nx = imgs[1 - fotoIdx];
  nx.onload = () => { cur.classList.remove('on'); nx.classList.add('on'); fotoIdx = 1 - fotoIdx; };
  nx.src = src;
  $('p', fotoBox).innerHTML = `${esc(pl.dataset.nombre)}<small>${esc(pl.dataset.desc)}</small>`;
}
let cartaCerca = false;
function fotoDeSeccion() { if (!cartaCerca) return; const p = $('.kit-carta__panel:not([hidden]) .plato.con-foto', cartaEl); if (p) mostrarFoto(p); }
document.addEventListener('kit:carta', (e) => {
  if (e.detail.el !== cartaEl) return;
  cartaCats = e.detail.categorias || [];
  cabeceras(); recortar(); pintarPasos(); fotoDeSeccion();
});
if (fotoBox) new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; cartaCerca = true; fotoDeSeccion(); o.disconnect(); }, { rootMargin: '400px' }).observe(fotoBox);
cartaEl?.addEventListener('click', (e) => { if (e.target.closest('.kit-tab')) setTimeout(() => { pintarPasos(); fotoDeSeccion(); }, 0); });
let rafF = 0;
cartaEl?.addEventListener('pointerover', (e) => { const pl = e.target.closest('.plato.con-foto'); if (!pl) return; cancelAnimationFrame(rafF); rafF = requestAnimationFrame(() => mostrarFoto(pl)); });
pasos?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-paso]'); if (!b) return;
  const tabs = $$('.kit-tab', cartaEl); const i = tabs.findIndex(t => t.classList.contains('is-on'));
  const n = tabs[i + Number(b.dataset.paso)]; if (!n) return;
  n.click(); n.scrollIntoView({ block: 'nearest', inline: 'center' });
  const top = $('#carta').getBoundingClientRect().top + scrollY + ($('.carta .cab').offsetHeight || 0);
  if (scrollY > top) scrollTo({ top: top - 20, behavior: 'smooth' });
});
function irCarta(cat) {
  const t = $(`.kit-tab[data-cat="${cat}"]`, cartaEl); if (t) { t.click(); t.scrollIntoView({ block: 'nearest', inline: 'center' }); }
  $('#carta').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- tira de fotos: se arrastra desde cualquier lado ---------- */
$$('[data-arrastre]').forEach(el => {
  let x0 = 0, s0 = 0, mov = false, id = null, v = 0, last = 0, lt = 0, raf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return; // el dedo usa el scroll nativo
    id = e.pointerId; x0 = e.clientX; s0 = el.scrollLeft; mov = false; v = 0; last = e.clientX; lt = performance.now(); cancelAnimationFrame(raf);
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - x0;
    if (!mov && Math.abs(dx) > 4) { mov = true; el.classList.add('drag'); el.setPointerCapture(id); }
    if (mov) { el.scrollLeft = s0 - dx; const t = performance.now(); v = (e.clientX - last) / Math.max(1, t - lt); last = e.clientX; lt = t; }
  });
  const fin = (e) => {
    if (e.pointerId !== id) return; id = null;
    if (!mov) return;
    let vel = -v * 16;
    const paso = () => { if (Math.abs(vel) < .5) { el.classList.remove('drag'); return; } el.scrollLeft += vel; vel *= .92; raf = requestAnimationFrame(paso); };
    paso();
    setTimeout(() => { mov = false; }, 0);
  };
  el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
  el.addEventListener('click', (e) => { if (mov) { e.preventDefault(); e.stopPropagation(); } }, true);
  el.addEventListener('dragstart', (e) => e.preventDefault());
});

/* ---------- ñoquis del 29: cuenta regresiva ---------- */
(function () {
  const p = prox29(); const n = $('[data-faltan]'), t = $('[data-faltan-txt]'); if (!n || !p) return;
  if (p.dias === 0) { n.textContent = 'HOY'; t.textContent = 'Es 29: ñoquis en las dos sedes. La plata abajo del plato, como manda la tradición.'; }
  else { n.textContent = p.dias; t.textContent = `${p.dias === 1 ? 'día' : 'días'} para el próximo 29. La plata abajo del plato, como manda la tradición.`; }
})();

/* ---------- sedes: horarios, estado y mapa ---------- */
const DIAS = [['lun', 'Lunes'], ['mar', 'Martes'], ['mie', 'Miércoles'], ['jue', 'Jueves'], ['vie', 'Viernes'], ['sab', 'Sábado'], ['dom', 'Domingo']];
const KEYS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const aMin = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const fmt = (h) => `${Number(h.split(':')[0])}:${h.split(':')[1]}`;
let sede = 'palermo';
function ahoraBA() { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })); return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
const rango = ([a, c]) => { const A = aMin(a); let C = aMin(c); if (C <= A) C += 1440; return [A, C]; };
function estado(s) {
  const { dow, min } = ahoraBA();
  const hoy = s.horas[KEYS[dow]] || [], ayer = s.horas[KEYS[(dow + 6) % 7]] || [];
  const ahora = hoy.find(r => { const [A, C] = rango(r); return min >= A && min < C; }) || ayer.find(r => { const [A, C] = rango(r); return C > 1440 && min < C - 1440; });
  if (ahora) return { ok: true, txt: `Abierto ahora · cierra a las ${fmt(ahora[1])} hs` };
  const prox = hoy.find(([a]) => aMin(a) > min);
  if (prox) return { ok: false, txt: `Cerrado · abre hoy a las ${fmt(prox[0])} hs` };
  for (let i = 1; i < 8; i++) { const k = KEYS[(dow + i) % 7]; if (s.horas[k]?.length) return { ok: false, txt: `Cerrado · abre ${i === 1 ? 'mañana' : 'el ' + DIAS.find(d => d[0] === k)[1].toLowerCase()} a las ${fmt(s.horas[k][0][0])} hs` }; }
  return { ok: false, txt: 'Cerrado' };
}
function pintarSede() {
  const s = SEDES[sede]; const { dow } = ahoraBA();
  $$('.sede-sel button').forEach(b => b.setAttribute('aria-pressed', b.dataset.sede === sede));
  const e = estado(s); const est = $('[data-estado]'); est.classList.toggle('cerrado', !e.ok); $('span', est).textContent = e.txt;
  $('[data-dir]').innerHTML = `${esc(s.dir)}<small>${esc(s.barrio)}</small>`;
  $('[data-horas]').innerHTML = DIAS.map(([k, n]) => { const fr = s.horas[k] || [];
    const noche = sede === 'palermo' && k === 'lun';
    return `<tr class="${KEYS[dow] === k ? 'hoy' : ''}"><th scope="row">${n}${KEYS[dow] === k ? ' (hoy)' : ''}</th><td>${fr.length ? fr.map(([a, c]) => `${fmt(a)} a ${fmt(c)} hs`).join('<br>') + (noche ? `<br><span class="x">Noche cerrado</span>` : '') : '<span class="x">Cerrado</span>'}</td></tr>`; }).join('');
  const wa = $('[data-wa]'); wa.href = `https://wa.me/${s.wa}?text=${encodeURIComponent(`Hola Bodegón Núñez ${s.nombre}!`)}`; wa.firstChild.textContent = `WhatsApp ${s.waTxt} `;
  const ifr = $('[data-mapa]'); const url = `https://www.google.com/maps?q=${s.q}&z=15&output=embed`;
  if (ifr.dataset.cargado) ifr.src = url; else ifr.dataset.src = url;
}
$('.sede-sel')?.addEventListener('click', (e) => { const b = e.target.closest('[data-sede]'); if (!b) return; sede = b.dataset.sede; pintarSede(); });
if ($('[data-mapa]')) {
  pintarSede();
  new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; const f = $('[data-mapa]'); f.dataset.cargado = 1; f.src = f.dataset.src; o.disconnect(); }, { rootMargin: '400px' }).observe($('[data-mapa]'));
  setInterval(pintarSede, 60000);
}

/* ---------- el dock del celu se corre sobre el pie del WOW (no tapa el CTA) ---------- */
const tk = $('.ticket');
if (tk) new IntersectionObserver(([e]) => H.classList.toggle('dock-off', e.isIntersecting), { threshold: .05 }).observe(tk);
