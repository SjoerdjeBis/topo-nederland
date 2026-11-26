// Vlaggen van de landen van de wereld, als kleine SVG-tekeningen (viewBox 0 0 30 20).
// Ingewikkelde wapens zijn vereenvoudigd; kleuren en indeling kloppen.
// Per land: [naam, werelddeel, hoofdstad, svg]
(function () {
const R = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const H = (...c) => c.map((k, i) => R(0, +(i * 20 / c.length).toFixed(2), 30, +(20 / c.length + .05).toFixed(2), k)).join('');
const V = (...c) => c.map((k, i) => R(+(i * 30 / c.length).toFixed(2), 0, +(30 / c.length + .05).toFixed(2), 20, k)).join('');
const HW = (...p) => { const t = p.reduce((s, [, w]) => s + w, 0); let y = 0; return p.map(([c, w]) => { const r = R(0, +y.toFixed(2), 30, +(w * 20 / t + .05).toFixed(2), c); y += w * 20 / t; return r; }).join(''); };
const VW = (...p) => { const t = p.reduce((s, [, w]) => s + w, 0); let x = 0; return p.map(([c, w]) => { const r = R(+x.toFixed(2), 0, +(w * 30 / t + .05).toFixed(2), 20, c); x += w * 30 / t; return r; }).join(''); };
const P = (pts, c, extra = '') => `<polygon points="${pts}" fill="${c}"${extra}/>`;
const C = (x, y, r, c, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"${extra}/>`;
const PA = (d, c, extra = '') => `<path d="${d}" fill="${c}"${extra}/>`;
const L = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
function S(x, y, r, c, n = 5, k = .382, rot = -90) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r * k : r;
    pts.push((x + Math.cos(a) * rr).toFixed(2) + ',' + (y + Math.sin(a) * rr).toFixed(2));
  }
  return P(pts.join(' '), c);
}
const CRES = (x, y, r, c, bg, dx = r * .3, dy = 0) => C(x, y, r, c) + C(x + dx, y + dy, r * .82, bg);
const NORDIC = (bg, cr, inner) => R(0, 0, 30, 20, bg) + R(8, 0, inner ? 5 : 4, 20, cr) + R(0, inner ? 7.5 : 8, 30, inner ? 5 : 4, cr) + (inner ? R(9.25, 0, 2.5, 20, inner) + R(0, 8.75, 30, 2.5, inner) : '');
const NEST = (x, y, w, h, vb, s) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="none">${s}</svg>`;
const UJ_INNER = R(0, 0, 60, 30, '#012169') + L('M0 0L60 30M60 0L0 30', '#fff', 6) + L('M0 0L60 30M60 0L0 30', '#c8102e', 2) + L('M30 0v30M0 15h60', '#fff', 10) + L('M30 0v30M0 15h60', '#c8102e', 6);
const UJ = (w = 15, h = 10) => NEST(0, 0, w, h, '0 0 60 30', UJ_INNER);
const TRI = (c, d = 13) => P(`0,0 ${d},10 0,20`, c);
const DIAG = (a, b) => P('0,0 30,0 0,20', a) + P('30,0 30,20 0,20', b);
const STARS_ROW = (pts, r, c) => pts.map(([x, y]) => S(x, y, r, c)).join('');
const SUN = (x, y, r, c, n = 16, rl = 1.7) => C(x, y, r, c) + Array.from({ length: n }, (_, i) => { const a = i * 2 * Math.PI / n; return `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * r * rl).toFixed(2)}" y2="${(y + Math.sin(a) * r * rl).toFixed(2)}" stroke="${c}" stroke-width=".55"/>`; }).join('');
const STRIPES = (n, a, b) => Array.from({ length: n }, (_, i) => R(0, +(i * 20 / n).toFixed(3), 30, +(20 / n + .04).toFixed(3), i % 2 ? b : a)).join('');
const TXT = (x, y, s, c, size) => `<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-family="serif" text-anchor="middle" font-weight="700">${s}</text>`;
const EMB = (x, y, r, c) => PA(`M${x - r} ${y - r * .9}h${r * 2}v${r}q0 ${r * 1.1}-${r} ${r * 1.5}q-${r}-${r * .4}-${r}-${r * 1.5}z`, c); // eenvoudig wapenschild

const F = {
  // ===================== EUROPA =====================
  nl: ['Nederland', 'Europa', 'Amsterdam', H('#ae1c28', '#fff', '#21468b')],
  be: ['België', 'Europa', 'Brussel', V('#000', '#fdda24', '#ef3340')],
  de: ['Duitsland', 'Europa', 'Berlijn', H('#000', '#dd0000', '#ffce00')],
  fr: ['Frankrijk', 'Europa', 'Parijs', V('#002395', '#fff', '#ed2939')],
  lu: ['Luxemburg', 'Europa', 'Luxemburg', H('#ed2939', '#fff', '#00a1de')],
  gb: ['Verenigd Koninkrijk', 'Europa', 'Londen', NEST(0, 0, 30, 20, '0 0 60 30', UJ_INNER)],
  ie: ['Ierland', 'Europa', 'Dublin', V('#169b62', '#fff', '#ff883e')],
  es: ['Spanje', 'Europa', 'Madrid', HW(['#aa151b', 1], ['#f1bf00', 2], ['#aa151b', 1]) + EMB(9, 9, 2.2, '#aa151b') + R(6.3, 7, .8, 5, '#ccc') + R(11, 7, .8, 5, '#ccc')],
  pt: ['Portugal', 'Europa', 'Lissabon', VW(['#046a38', 2], ['#da291c', 3]) + C(12, 10, 4, 'none', ' stroke="#ffe900" stroke-width="1.2"') + EMB(12, 9.6, 2, '#fff') + EMB(12, 9.8, 1.4, '#da291c')],
  it: ['Italië', 'Europa', 'Rome', V('#009246', '#fff', '#ce2b37')],
  mt: ['Malta', 'Europa', 'Valletta', R(0, 0, 15, 20, '#fff') + R(15, 0, 15, 20, '#cf142b') + PA('M3 2.5h1.4v1.5h1.5v1.4H4.4v1.5H3V5.4H1.5V4H3z', '#9ea3a7')],
  ch: ['Zwitserland', 'Europa', 'Bern', R(0, 0, 30, 20, '#da291c') + R(13, 4, 4, 12, '#fff') + R(9, 8, 12, 4, '#fff')],
  li: ['Liechtenstein', 'Europa', 'Vaduz', H('#002b7f', '#ce1126') + PA('M5 3.2l1 1.4 1-1.6 1 1.6 1-1.4.6 2.6H4.4z', '#ffd83d')],
  at: ['Oostenrijk', 'Europa', 'Wenen', H('#ed2939', '#fff', '#ed2939')],
  mc: ['Monaco', 'Europa', 'Monaco', H('#ce1126', '#fff')],
  ad: ['Andorra', 'Europa', 'Andorra la Vella', VW(['#10069f', 8], ['#fedd00', 9], ['#d50032', 8]) + EMB(15, 9, 2.2, '#c7a02b')],
  sm: ['San Marino', 'Europa', 'San Marino', H('#fff', '#5eb6e4') + EMB(15, 8.8, 2.2, '#d4a017')],
  dk: ['Denemarken', 'Europa', 'Kopenhagen', NORDIC('#c8102e', '#fff')],
  no: ['Noorwegen', 'Europa', 'Oslo', NORDIC('#ba0c2f', '#fff', '#00205b')],
  se: ['Zweden', 'Europa', 'Stockholm', NORDIC('#006aa7', '#fecc00')],
  fi: ['Finland', 'Europa', 'Helsinki', NORDIC('#fff', '#002f6c')],
  is: ['IJsland', 'Europa', 'Reykjavik', NORDIC('#02529c', '#fff', '#dc1e35')],
  ee: ['Estland', 'Europa', 'Tallinn', H('#0072ce', '#000', '#fff')],
  lv: ['Letland', 'Europa', 'Riga', HW(['#9e3039', 2], ['#fff', 1], ['#9e3039', 2])],
  lt: ['Litouwen', 'Europa', 'Vilnius', H('#fdb913', '#006a44', '#c1272d')],
  pl: ['Polen', 'Europa', 'Warschau', H('#fff', '#dc143c')],
  cz: ['Tsjechië', 'Europa', 'Praag', H('#fff', '#d7141a') + P('0,0 15,10 0,20', '#11457e')],
  sk: ['Slowakije', 'Europa', 'Bratislava', H('#fff', '#0b4ea2', '#ee1c25') + EMB(9.5, 7.2, 3.2, '#fff') + EMB(9.5, 7.4, 2.8, '#ee1c25') + R(9.1, 5.2, .8, 5, '#fff') + R(7.9, 6.3, 3.2, .7, '#fff') + PA('M7 11.8q2.5-2 5 0z', '#0b4ea2')],
  hu: ['Hongarije', 'Europa', 'Boedapest', H('#cd2a3e', '#fff', '#436f4d')],
  si: ['Slovenië', 'Europa', 'Ljubljana', H('#fff', '#0000ff', '#ff0000') + EMB(8, 5.6, 2.2, '#0000ff') + PA('M5.9 7.6l1.2-2 .9 1.3.9-1.3 1.2 2z', '#fff') + R(7.6, 3.6, .8, .8, '#ffdd00')],
  hr: ['Kroatië', 'Europa', 'Zagreb', H('#ff0000', '#fff', '#171796') + EMB(15, 8.4, 3, '#fff') + [0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => (r + c) % 2 ? '' : R(12.2 + c * 1.12, 5.7 + r * 1.12, 1.12, 1.12, '#ff0000')).join('')).join('')],
  ba: ['Bosnië en Herzegovina', 'Europa', 'Sarajevo', R(0, 0, 30, 20, '#002395') + P('8,0 23,0 23,20', '#fecb00') + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => S(6 + i * 2, -1 + i * 2.6, .9, '#fff')).join('')],
  rs: ['Servië', 'Europa', 'Belgrado', H('#c6363c', '#0c4076', '#fff') + EMB(10, 7, 2.6, '#c6363c') + PA('M8.6 6l1.4 1.2L11.4 6v2.6L10 9.8 8.6 8.6z', '#fff')],
  me: ['Montenegro', 'Europa', 'Podgorica', R(0, 0, 30, 20, '#d4af37') + R(1, 1, 28, 18, '#c40308') + PA('M15 5l2 1.5 3-1-1 3 1.5 1.5-3 .5-.8 3.5-1.7-1.6-1.7 1.6-.8-3.5-3-.5L11 8.5l-1-3 3 1z', '#d4af37')],
  al: ['Albanië', 'Europa', 'Tirana', R(0, 0, 30, 20, '#e41e20') + PA('M15 4.2l1.3 2 3.4-1.5-1.3 2.8 3.3.6-3 1.6 1.8 2.6-3.4-.6.2 3.3-2.3-2.2-2.3 2.2.2-3.3-3.4.6 1.8-2.6-3-1.6 3.3-.6-1.3-2.8 3.4 1.5z', '#000')],
  mk: ['Noord-Macedonië', 'Europa', 'Skopje', R(0, 0, 30, 20, '#d20000') + P('0,0 4,0 15,10 0,3', '#ffe600') + P('26,0 30,0 30,3 15,10', '#ffe600') + P('0,17 15,10 4,20 0,20', '#ffe600') + P('30,17 30,20 26,20 15,10', '#ffe600') + P('13,0 17,0 15,10', '#ffe600') + P('13,20 17,20 15,10', '#ffe600') + P('0,8.5 0,11.5 15,10', '#ffe600') + P('30,8.5 30,11.5 15,10', '#ffe600') + C(15, 10, 3.2, '#d20000') + C(15, 10, 2.6, '#ffe600')],
  xk: ['Kosovo', 'Europa', 'Pristina', R(0, 0, 30, 20, '#244aa5') + PA('M11 8.5l3-1 2 .5 2.5-.5 1.5 1.5-.5 2.5 1 2-2 2-3 .5-2-1.5-1.5-2.5z', '#d0a650') + [10, 12.4, 14.8, 17.2, 19.6, 22].map((x, i) => S(x - 1, 6.2 - Math.sin(i / 5 * Math.PI) * 1.5, .8, '#fff')).join('')],
  gr: ['Griekenland', 'Europa', 'Athene', STRIPES(9, '#0d5eaf', '#fff') + R(0, 0, 11.1, 11.1, '#0d5eaf') + R(4.44, 0, 2.22, 11.1, '#fff') + R(0, 4.44, 11.1, 2.22, '#fff')],
  bg: ['Bulgarije', 'Europa', 'Sofia', H('#fff', '#00966e', '#d62612')],
  ro: ['Roemenië', 'Europa', 'Boekarest', V('#002b7f', '#fcd116', '#ce1126')],
  md: ['Moldavië', 'Europa', 'Chisinau', V('#0046ae', '#ffd200', '#cc092f') + EMB(15, 8.8, 2.4, '#b07e2f') + EMB(15, 9.2, 1.6, '#cc092f')],
  ua: ['Oekraïne', 'Europa', 'Kyiv', H('#0057b7', '#ffd700')],
  by: ['Belarus', 'Europa', 'Minsk', HW(['#c8313e', 2], ['#4aa657', 1]) + R(0, 0, 3.3, 20, '#fff') + Array.from({ length: 6 }, (_, i) => PA(`M1.65 ${1 + i * 3.3}l1.2 1.6-1.2 1.6-1.2-1.6z`, '#c8313e')).join('')],
  ru: ['Rusland', 'Europa', 'Moskou', H('#fff', '#0039a6', '#d52b1e')],
  cy: ['Cyprus', 'Europa', 'Nicosia', R(0, 0, 30, 20, '#fff') + PA('M7 9.5l3-2 4 .3 3-1.5 4 .4 3.5-1.6-1.3 2.4-3.4 1.6-1.2 2.6-4.5.6-3.5-.4-2.6.8z', '#d57800') + PA('M11 14q4 2.5 8 0', 'none', ' stroke="#4e5b31" stroke-width=".9"')],

  // ===================== AZIË =====================
  tr: ['Turkije', 'Azië', 'Ankara', R(0, 0, 30, 20, '#e30a17') + CRES(11, 10, 5, '#fff', '#e30a17', 1.3) + S(17.3, 10, 2.5, '#fff', 5, .38, 180)],
  ge: ['Georgië', 'Azië', 'Tbilisi', R(0, 0, 30, 20, '#fff') + R(13, 0, 4, 20, '#ff0000') + R(0, 8, 30, 4, '#ff0000') + [[6.5, 4], [23.5, 4], [6.5, 16], [23.5, 16]].map(([x, y]) => R(x - .6, y - 2, 1.2, 4, '#ff0000') + R(x - 2, y - .6, 4, 1.2, '#ff0000')).join('')],
  am: ['Armenië', 'Azië', 'Jerevan', H('#d90012', '#0033a0', '#f2a800')],
  az: ['Azerbeidzjan', 'Azië', 'Bakoe', H('#00b5e2', '#ef3340', '#509e2f') + CRES(14, 10, 2.6, '#fff', '#ef3340', .8) + S(17, 10, 1.3, '#fff', 8, .5)],
  kz: ['Kazachstan', 'Azië', 'Astana', R(0, 0, 30, 20, '#00afca') + SUN(16, 8, 2.6, '#fec50c', 24, 1.6) + PA('M10.5 12.5q5.5 3 11 0q-5.5 1.5-11 0z', '#fec50c') + R(1, 0, 1.4, 20, '#fec50c')],
  uz: ['Oezbekistan', 'Azië', 'Tasjkent', HW(['#0099b5', 6], ['#ce1126', .4], ['#fff', 6], ['#ce1126', .4], ['#1eb53a', 6]) + CRES(4.5, 3.3, 2.2, '#fff', '#0099b5', .8) + [0, 1, 2, 3, 4].map(i => S(8 + i * 1.5, 4.7, .45, '#fff')).join('') + [1, 2, 3, 4].map(i => S(8 + i * 1.5, 3.2, .45, '#fff')).join('') + [2, 3, 4].map(i => S(8 + i * 1.5, 1.7, .45, '#fff')).join('')],
  tm: ['Turkmenistan', 'Azië', 'Asjchabad', R(0, 0, 30, 20, '#00843d') + R(4, 0, 5, 20, '#d22630') + Array.from({ length: 5 }, (_, i) => C(6.5, 2 + i * 4, 1.4, '#ffb81c')).join('') + CRES(13, 5, 2.6, '#fff', '#00843d', 1) + [0, 1, 2, 3, 4].map(i => S(16 + (i % 2), 2.6 + i * 1.2, .5, '#fff')).join('')],
  kg: ['Kirgizië', 'Azië', 'Bisjkek', R(0, 0, 30, 20, '#e8112d') + SUN(15, 10, 3.6, '#ffef00', 40, 1.55) + C(15, 10, 2.4, '#e8112d') + C(15, 10, 1.9, '#ffef00') + L('M13.3 9.2h3.4M13.3 10.8h3.4M14.2 8.3v3.4M15.8 8.3v3.4', '#e8112d', .35)],
  tj: ['Tadzjikistan', 'Azië', 'Doesjanbe', HW(['#cc0000', 2], ['#fff', 3], ['#006600', 2]) + PA('M13 11.5h4l-.4-1.5-1.6 1-1.6-1z', '#f8c300') + [0, 1, 2, 3, 4, 5, 6].map(i => S(11.5 + i * 1.17, 8.6 - Math.sin(i / 6 * Math.PI) * 1.2, .45, '#f8c300')).join('')],
  mn: ['Mongolië', 'Azië', 'Ulaanbaatar', V('#c4272f', '#015197', '#c4272f') + C(5, 5, 1, '#f9cf02') + R(3.4, 7, 3.2, .8, '#f9cf02') + C(5, 10, 1.4, '#f9cf02') + R(3.4, 12.2, 3.2, .8, '#f9cf02') + R(3.4, 14, 3.2, .8, '#f9cf02') + R(2.4, 7, .7, 8, '#f9cf02') + R(6.9, 7, .7, 8, '#f9cf02')],
  cn: ['China', 'Azië', 'Peking', R(0, 0, 30, 20, '#ee1c25') + S(5, 5, 3, '#ffff00') + S(10, 2, 1, '#ffff00', 5, .38, -60) + S(12, 4, 1, '#ffff00', 5, .38, -80) + S(12, 7, 1, '#ffff00', 5, .38, -100) + S(10, 9, 1, '#ffff00', 5, .38, -120)],
  jp: ['Japan', 'Azië', 'Tokio', R(0, 0, 30, 20, '#fff') + C(15, 10, 6, '#bc002d')],
  kr: ['Zuid-Korea', 'Azië', 'Seoul', R(0, 0, 30, 20, '#fff') + C(15, 10, 5, '#0047a0') + PA('M10 10a5 5 0 0 1 10 0a2.5 2.5 0 0 1-5 0a2.5 2.5 0 0 0-5 0z', '#cd2e3a') + [[-36, 6.5, 5], [36, 23.5, 5], [36, 6.5, 15], [-36, 23.5, 15]].map(([a, x, y]) => `<g transform="rotate(${a} ${x} ${y})">${R(x - 2, y - 1.6, 4, .7, '#000') + R(x - 2, y - .35, 4, .7, '#000') + R(x - 2, y + .9, 4, .7, '#000')}</g>`).join('')],
  kp: ['Noord-Korea', 'Azië', 'Pyongyang', HW(['#024fa2', 3], ['#fff', .5], ['#ed1c27', 12], ['#fff', .5], ['#024fa2', 3]) + C(10, 10, 4, '#fff') + S(10, 10, 3.8, '#ed1c27')],
  tw: null,
  vn: ['Vietnam', 'Azië', 'Hanoi', R(0, 0, 30, 20, '#da251d') + S(15, 10.5, 6, '#ffff00')],
  la: ['Laos', 'Azië', 'Vientiane', HW(['#ce1126', 1], ['#002868', 2], ['#ce1126', 1]) + C(15, 10, 4, '#fff')],
  kh: ['Cambodja', 'Azië', 'Phnom Penh', HW(['#032ea1', 1], ['#e00025', 2], ['#032ea1', 1]) + PA('M9 13.5h12v-1.2h-1v-2h-1v-2.5l-.6-1-.6 1v2.5h-1v-3l-.8-2-.8 2v3h-1v-2.5l-.6-1-.6 1v2.5h-1v2h-1z', '#fff')],
  th: ['Thailand', 'Azië', 'Bangkok', HW(['#a51931', 1], ['#f4f5f8', 1], ['#2d2a4a', 2], ['#f4f5f8', 1], ['#a51931', 1])],
  mm: ['Myanmar', 'Azië', 'Naypyidaw', H('#fecb00', '#34b233', '#ea2839') + S(15, 11, 7, '#fff')],
  my: ['Maleisië', 'Azië', 'Kuala Lumpur', STRIPES(14, '#cc0001', '#fff') + R(0, 0, 15, 11.43, '#010066') + CRES(5.5, 5.7, 3.8, '#fc0', '#010066', 1.1) + S(10.5, 5.7, 2.4, '#fc0', 14, .45)],
  sg: ['Singapore', 'Azië', 'Singapore', H('#ef3340', '#fff') + CRES(5.5, 5, 3, '#fff', '#ef3340', 1.1) + [[8, 2.6], [10, 4.1], [9.2, 6.4], [6.8, 6.4], [6, 4.1]].map(([x, y]) => S(x + .8, y, .7, '#fff')).join('')],
  id: ['Indonesië', 'Azië', 'Jakarta', H('#ce1126', '#fff')],
  ph: ['Filipijnen', 'Azië', 'Manilla', H('#0038a8', '#ce1126') + P('0,0 17.3,10 0,20', '#fff') + SUN(6, 10, 2, '#fcd116', 8, 1.9) + S(1.8, 3, .9, '#fcd116') + S(1.8, 17, .9, '#fcd116') + S(14.5, 10, .9, '#fcd116')],
  tl: ['Oost-Timor', 'Azië', 'Dili', R(0, 0, 30, 20, '#dc241f') + P('0,0 15,10 0,20', '#ffc726') + P('0,0 10,10 0,20', '#000') + S(3.6, 10, 2.2, '#fff', 5, .38, -110)],
  bn: ['Brunei', 'Azië', 'Bandar Seri Begawan', R(0, 0, 30, 20, '#f7e017') + P('0,3.5 30,13 30,18 0,8.5', '#fff') + P('0,8.5 30,18 30,22 0,12.5', '#000') + C(15, 10, 3, '#cf1126') + PA('M12.5 9h5l-1 2h-3z', '#f7e017')],
  bd: ['Bangladesh', 'Azië', 'Dhaka', R(0, 0, 30, 20, '#006a4e') + C(13.5, 10, 5.5, '#f42a41')],
  in: ['India', 'Azië', 'New Delhi', H('#ff9933', '#fff', '#138808') + C(15, 10, 2.6, 'none', ' stroke="#000080" stroke-width=".6"') + L(Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 12; return `M${(15 - Math.cos(a) * 2.6).toFixed(2)} ${(10 - Math.sin(a) * 2.6).toFixed(2)}L${(15 + Math.cos(a) * 2.6).toFixed(2)} ${(10 + Math.sin(a) * 2.6).toFixed(2)}`; }).join(''), '#000080', .25)],
  pk: ['Pakistan', 'Azië', 'Islamabad', R(0, 0, 7.5, 20, '#fff') + R(7.5, 0, 22.5, 20, '#01411c') + CRES(18.5, 10, 5.5, '#fff', '#01411c', 1.7, -1.4) + S(21.5, 6.8, 1.8, '#fff', 5, .38, -60)],
  np: ['Nepal', 'Azië', 'Kathmandu', PA('M4 .5L22 11H8.5L22 19.5H4z', '#dc143c', ' stroke="#003893" stroke-width="1.3" stroke-linejoin="round"') + CRES(8.3, 7.5, 1.9, '#fff', '#dc143c', 0, -.9) + S(8.3, 15, 1.9, '#fff', 12, .6)],
  bt: ['Bhutan', 'Azië', 'Thimphu', P('0,0 30,0 0,20', '#ffd520') + P('30,0 30,20 0,20', '#ff4e12') + PA('M7 14q3-1 5-3t5-4q3-2 6-1q-2 1-3 2.5t-4 3q-3 1.5-5 3t-4-.5z', '#fff')],
  lk: ['Sri Lanka', 'Azië', 'Colombo', R(0, 0, 30, 20, '#ffbe29') + R(1, 1, 3.5, 18, '#00534e') + R(4.5, 1, 3.5, 18, '#eb7400') + R(9, 1, 20, 18, '#8d153a') + PA('M14 14l1-5 2-2 3 0 1.5 2-1 1 1 2.5 1.5-1.5v3z', '#ffbe29')],
  ir: ['Iran', 'Azië', 'Teheran', H('#239f40', '#fff', '#da0000') + PA('M15 7.3q-1.7 1.2-1.3 3q.4 1.2 1.3 1.6q.9-.4 1.3-1.6q.4-1.8-1.3-3z', '#da0000') + PA('M13 7.8q-1.5 2 0 4.2M17 7.8q1.5 2 0 4.2', 'none', ' stroke="#da0000" stroke-width=".5"')],
  iq: ['Irak', 'Azië', 'Bagdad', H('#ce1126', '#fff', '#000') + TXT(15, 11.8, 'الله أكبر', '#007a3d', 3.6)],
  sy: ['Syrië', 'Azië', 'Damascus', H('#007a3d', '#fff', '#000') + S(9.5, 10, 1.7, '#ce1126') + S(15, 10, 1.7, '#ce1126') + S(20.5, 10, 1.7, '#ce1126')],
  lb: ['Libanon', 'Azië', 'Beiroet', HW(['#ed1c24', 1], ['#fff', 2], ['#ed1c24', 1]) + P('15,5.5 19,13 11,13', '#00a651') + R(14.4, 12.5, 1.2, 1.6, '#00a651')],
  il: ['Israël', 'Azië', 'Jeruzalem', R(0, 0, 30, 20, '#fff') + R(0, 2, 30, 2.6, '#0038b8') + R(0, 15.4, 30, 2.6, '#0038b8') + P('15,6.2 18.3,12 11.7,12', 'none', ' stroke="#0038b8" stroke-width=".7"') + P('15,13.8 18.3,8 11.7,8', 'none', ' stroke="#0038b8" stroke-width=".7"')],
  jo: ['Jordanië', 'Azië', 'Amman', H('#000', '#fff', '#007a3d') + P('0,0 15,10 0,20', '#ce1126') + S(5, 10, 1.6, '#fff', 7, .5)],
  sa: ['Saoedi-Arabië', 'Azië', 'Riyad', R(0, 0, 30, 20, '#006c35') + TXT(15, 9.5, 'لا إله إلا الله', '#fff', 3.4) + PA('M8 13.2h13.5l1.2-.6v1.2l-1.2-.6H9.5v.8H8z', '#fff')],
  ye: ['Jemen', 'Azië', 'Sanaa', H('#ce1126', '#fff', '#000')],
  om: ['Oman', 'Azië', 'Muscat', R(0, 0, 30, 20, '#db161b') + R(8, 0, 22, 6.67, '#fff') + R(8, 13.33, 22, 6.67, '#008000') + PA('M2.5 2l3 3M5.5 2l-3 3', 'none', ' stroke="#fff" stroke-width=".7"') + C(4, 3.2, .8, '#fff')],
  ae: ['Verenigde Arabische Emiraten', 'Azië', 'Abu Dhabi', H('#00732f', '#fff', '#000') + R(0, 0, 8, 20, '#ff0000')],
  qa: ['Qatar', 'Azië', 'Doha', R(0, 0, 30, 20, '#8a1538') + P('0,0 8,0 ' + Array.from({ length: 9 }, (_, i) => `11,${(i * 20 / 9 + 1.11).toFixed(2)} 8,${((i + 1) * 20 / 9).toFixed(2)}`).join(' ') + ' 0,20', '#fff')],
  bh: ['Bahrein', 'Azië', 'Manama', R(0, 0, 30, 20, '#ce1126') + P('0,0 7,0 ' + Array.from({ length: 5 }, (_, i) => `11,${(i * 4 + 2).toFixed(1)} 7,${((i + 1) * 4).toFixed(1)}`).join(' ') + ' 0,20', '#fff')],
  kw: ['Koeweit', 'Azië', 'Koeweit-Stad', H('#007a3d', '#fff', '#ce1126') + P('0,0 7.5,6.67 7.5,13.33 0,20', '#000')],
  af: null,

  // ===================== AFRIKA =====================
  ma: ['Marokko', 'Afrika', 'Rabat', R(0, 0, 30, 20, '#c1272d') + S(15, 10.3, 4.2, 'none', 5, .382).replace('fill="none"', 'fill="none" stroke="#006233" stroke-width=".8"')],
  dz: ['Algerije', 'Afrika', 'Algiers', R(0, 0, 15, 20, '#006233') + R(15, 0, 15, 20, '#fff') + CRES(15.5, 10, 4.2, '#d21034', '#fff', 1.2) + S(17.3, 10, 2, '#d21034', 5, .38, 180)],
  tn: ['Tunesië', 'Afrika', 'Tunis', R(0, 0, 30, 20, '#e70013') + C(15, 10, 5, '#fff') + CRES(14.6, 10, 3.8, '#e70013', '#fff', 1) + S(16, 10, 2, '#e70013', 5, .38, 180)],
  ly: ['Libië', 'Afrika', 'Tripoli', HW(['#e70013', 1], ['#000', 2], ['#239e46', 1]) + CRES(14.2, 10, 3, '#fff', '#000', 1) + S(16.8, 10, 1.4, '#fff', 5, .38, 180)],
  eg: ['Egypte', 'Afrika', 'Caïro', H('#ce1126', '#fff', '#000') + PA('M15 7.2l1 1.2 2-.6-.8 2 .8 1.6h-6l.8-1.6-.8-2 2 .6z', '#c09300')],
  sd: ['Soedan', 'Afrika', 'Khartoem', H('#d21034', '#fff', '#000') + P('0,0 10,10 0,20', '#007229')],
  ss: ['Zuid-Soedan', 'Afrika', 'Juba', HW(['#000', 6], ['#fff', 1], ['#da121a', 6], ['#fff', 1], ['#078930', 6]) + P('0,0 11,10 0,20', '#0f47af') + S(3.6, 10, 2.3, '#fcdd09', 5, .38, -110)],
  er: ['Eritrea', 'Afrika', 'Asmara', P('0,0 30,0 30,10', '#12ad2b') + P('0,20 30,10 30,20', '#4189dd') + P('0,0 30,10 0,20', '#ea0437') + C(7.5, 10, 2.8, 'none', ' stroke="#ffc726" stroke-width=".7"') + R(7.2, 7.5, .6, 5, '#ffc726')],
  et: ['Ethiopië', 'Afrika', 'Addis Abeba', H('#078930', '#fcdd09', '#da121a') + C(15, 10, 4, '#0f47af') + S(15, 10.2, 3, 'none').replace('fill="none"', 'fill="none" stroke="#fcdd09" stroke-width=".6"')],
  dj: ['Djibouti', 'Afrika', 'Djibouti', H('#6ab2e7', '#12ad2b') + P('0,0 14,10 0,20', '#fff') + S(5, 10, 2, '#d7141a')],
  so: ['Somalië', 'Afrika', 'Mogadishu', R(0, 0, 30, 20, '#4189dd') + S(15, 10.5, 4.6, '#fff')],
  ke: ['Kenia', 'Afrika', 'Nairobi', HW(['#000', 6], ['#fff', 1], ['#bb0000', 6], ['#fff', 1], ['#006600', 6]) + PA('M15 3q3.5 3.5 0 14q-3.5-10.5 0-14z', '#bb0000', ' stroke="#000" stroke-width=".4"') + L('M12.5 2.5l5 15M17.5 2.5l-5 15', '#fff', .45) + PA('M15 7q1.2 3 0 6q-1.2-3 0-6z', '#fff')],
  ug: ['Oeganda', 'Afrika', 'Kampala', H('#000', '#fcdc04', '#d90000', '#000', '#fcdc04', '#d90000') + C(15, 10, 3.6, '#fff') + PA('M14 8.5l1.6-1 1 .8-.6 1 .8 2.8-1.6.8-1-1.2.5-1.5z', '#000')],
  tz: ['Tanzania', 'Afrika', 'Dodoma', P('0,0 26,0 0,17.3', '#1eb53a') + P('30,2.7 30,20 4,20', '#00a3dd') + P('0,20 0,15 22.5,0 30,0 30,5 7.5,20', '#fcd116') + P('0,20 0,17.5 26.2,0 30,0 30,2.5 3.8,20', '#000')],
  rw: ['Rwanda', 'Afrika', 'Kigali', HW(['#00a1de', 2], ['#fad201', 1], ['#20603d', 1]) + SUN(25, 5, 1.6, '#e5be01', 24, 1.6)],
  bi: ['Burundi', 'Afrika', 'Gitega', R(0, 0, 30, 20, '#1eb53a') + P('0,0 30,0 15,10', '#ce1126') + P('0,20 30,20 15,10', '#ce1126') + L('M0 0L30 20M30 0L0 20', '#fff', 3) + C(15, 10, 5, '#fff') + S(15, 7.8, 1.1, '#ce1126', 6, .55) + S(13, 11.3, 1.1, '#ce1126', 6, .55) + S(17, 11.3, 1.1, '#ce1126', 6, .55)],
  cd: ['Congo-Kinshasa', 'Afrika', 'Kinshasa', R(0, 0, 30, 20, '#007fff') + P('0,15 22,0 30,0 30,5 8,20 0,20', '#f7d618') + P('0,17 25,0 30,0 30,3 5,20 0,20', '#ce1021') + S(5, 4.5, 3, '#f7d618')],
  cg: ['Congo-Brazzaville', 'Afrika', 'Brazzaville', P('0,0 20,0 0,20', '#009543') + P('20,0 30,0 10,20 0,20', '#fbde4a') + P('30,0 30,20 10,20', '#dc241f')],
  ga: ['Gabon', 'Afrika', 'Libreville', H('#009e60', '#fcd116', '#3a75c4')],
  gq: ['Equatoriaal-Guinea', 'Afrika', 'Malabo', H('#3e9a00', '#fff', '#e32118') + P('0,0 7,10 0,20', '#0073ce') + EMB(15, 9, 1.4, '#c0c0c0')],
  cm: ['Kameroen', 'Afrika', 'Yaoundé', V('#007a5e', '#ce1126', '#fcd116') + S(15, 10, 3, '#fcd116')],
  cf: ['Centraal-Afrikaanse Republiek', 'Afrika', 'Bangui', H('#003082', '#fff', '#289728', '#ffce00') + R(12.5, 0, 5, 20, '#d21034') + S(5, 2.5, 1.8, '#ffce00')],
  td: ['Tsjaad', 'Afrika', 'N\'Djamena', V('#002664', '#fecb00', '#c60c30')],
  ne: ['Niger', 'Afrika', 'Niamey', H('#e05206', '#fff', '#0db02b') + C(15, 10, 2.4, '#e05206')],
  ng: ['Nigeria', 'Afrika', 'Abuja', V('#008751', '#fff', '#008751')],
  bj: ['Benin', 'Afrika', 'Porto-Novo', R(0, 0, 12, 20, '#008751') + R(12, 0, 18, 10, '#fcd116') + R(12, 10, 18, 10, '#e8112d')],
  tg: ['Togo', 'Afrika', 'Lomé', STRIPES(5, '#006a4e', '#ffce00') + R(0, 0, 12, 12, '#d21034') + S(6, 6, 3.6, '#fff')],
  gh: ['Ghana', 'Afrika', 'Accra', H('#ce1126', '#fcd116', '#006b3f') + S(15, 10.3, 3.3, '#000')],
  bf: ['Burkina Faso', 'Afrika', 'Ouagadougou', H('#ef2b2d', '#009e49') + S(15, 10.3, 3.3, '#fcd116')],
  ci: ['Ivoorkust', 'Afrika', 'Yamoussoukro', V('#f77f00', '#fff', '#009e60')],
  lr: ['Liberia', 'Afrika', 'Monrovia', STRIPES(11, '#bf0a30', '#fff') + R(0, 0, 9.1, 9.1, '#002868') + S(4.55, 4.7, 3, '#fff')],
  sl: ['Sierra Leone', 'Afrika', 'Freetown', H('#1eb53a', '#fff', '#0072c6')],
  gn: ['Guinee', 'Afrika', 'Conakry', V('#ce1126', '#fcd116', '#009460')],
  gw: ['Guinee-Bissau', 'Afrika', 'Bissau', R(0, 0, 30, 10, '#fcd116') + R(0, 10, 30, 10, '#009e49') + R(0, 0, 10, 20, '#ce1126') + S(5, 10, 3, '#000')],
  sn: ['Senegal', 'Afrika', 'Dakar', V('#00853f', '#fdef42', '#e31b23') + S(15, 10.3, 3, '#00853f')],
  gm: ['Gambia', 'Afrika', 'Banjul', HW(['#ce1126', 6], ['#fff', 1], ['#0c1c8c', 4], ['#fff', 1], ['#3a7728', 6])],
  ml: ['Mali', 'Afrika', 'Bamako', V('#14b53a', '#fcd116', '#ce1126')],
  mr: ['Mauritanië', 'Afrika', 'Nouakchott', HW(['#d01c1f', 1], ['#00a95c', 6], ['#d01c1f', 1]) + PA('M10.5 8.5a4.5 4.5 0 0 0 9 0a4.5 3.6 0 0 1-9 0z', '#ffd700') + S(15, 7, 1.4, '#ffd700')],
  cv: ['Kaapverdië', 'Afrika', 'Praia', HW(['#003893', 6], ['#fff', 1], ['#cf2027', 1], ['#fff', 1], ['#003893', 3]) + Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return S(11 + Math.cos(a) * 3.7, 13.2 + Math.sin(a) * 3.7, .65, '#f7d116'); }).join('')],
  st: ['Sao Tomé en Principe', 'Afrika', 'Sao Tomé', HW(['#12ad2b', 2], ['#ffce00', 3], ['#12ad2b', 2]) + P('0,0 9,10 0,20', '#d21034') + S(14, 10, 1.8, '#000') + S(21, 10, 1.8, '#000')],
  ao: ['Angola', 'Afrika', 'Luanda', H('#cc092f', '#000') + PA('M12 13a5 5 0 1 1 7-6', 'none', ' stroke="#ffcb00" stroke-width="1.1"') + PA('M11.5 13.5l7.5-5.5', 'none', ' stroke="#ffcb00" stroke-width="1"') + S(15.2, 8, 1, '#ffcb00')],
  zm: ['Zambia', 'Afrika', 'Lusaka', R(0, 0, 30, 20, '#198a00') + R(19.5, 7, 3.5, 13, '#de2010') + R(23, 7, 3.5, 13, '#000') + R(26.5, 7, 3.5, 13, '#ef7d00') + PA('M21 4.5q2.5-2 5 0q-1.2.3-2.5 1.6q-1.3-1.3-2.5-1.6z', '#ef7d00')],
  zw: ['Zimbabwe', 'Afrika', 'Harare', H('#006400', '#ffd200', '#d40000', '#000', '#d40000', '#ffd200', '#006400') + P('0,0 11.5,10 0,20', '#fff', ' stroke="#000" stroke-width=".4"') + S(4.2, 10, 2.6, '#d40000') + PA('M3.8 8.6l1 .4.2 1.8-.6 1.2-.6-1z', '#ffd200')],
  mw: ['Malawi', 'Afrika', 'Lilongwe', H('#000', '#ce1126', '#339e35') + SUN(15, 6.8, 2.2, '#ce1126', 31, 1.7).replace(/<circle[^>]*>/, '') + R(10, 6.67, 10, 3, '#000') + PA('M11.5 6.7a3.5 3.5 0 0 1 7 0z', '#ce1126')],
  mz: ['Mozambique', 'Afrika', 'Maputo', HW(['#007168', 6], ['#fff', 1], ['#000', 6], ['#fff', 1], ['#fce100', 6]) + P('0,0 13,10 0,20', '#d21034') + S(4.5, 10, 2.8, '#fce100') + L('M3 11.5l3-2.5M3 9l3 2.5', '#000', .5)],
  na: ['Namibië', 'Afrika', 'Windhoek', P('0,0 24,0 0,16', '#003580') + P('30,4 30,20 6,20', '#009543') + P('0,20 0,15 22.5,0 30,0 30,5 7.5,20', '#fff') + P('0,20 0,17.5 26.2,0 30,0 30,2.5 3.8,20', '#d21034') + SUN(5.5, 5, 1.8, '#ffce00', 12, 1.7)],
  bw: ['Botswana', 'Afrika', 'Gaborone', R(0, 0, 30, 20, '#75aadb') + R(0, 7.5, 30, 5, '#fff') + R(0, 8.5, 30, 3, '#000')],
  za: ['Zuid-Afrika', 'Afrika', 'Pretoria', R(0, 0, 30, 10, '#e03c31') + R(0, 10, 30, 10, '#001489') + PA('M0 0h4.5l10 6.67H30v6.66H14.5L4.5 20H0z', '#fff') + PA('M0 0h2.2l10.8 8H30v4H13l-10.8 8H0z', '#007749') + P('0,2.5 11,10 0,17.5', '#ffb81c') + P('0,4 9,10 0,16', '#000')],
  ls: ['Lesotho', 'Afrika', 'Maseru', HW(['#00209f', 3], ['#fff', 4], ['#009543', 3]) + PA('M12.5 12.2q2.5-.8 5 0l-1.2-1.3-1.3-3.3-1.3 3.3z', '#000') + R(14.6, 6.5, .8, 1.4, '#000')],
  sz: ['Eswatini', 'Afrika', 'Mbabane', HW(['#3e5eb9', 3], ['#ffd900', 1], ['#b10c0c', 6], ['#ffd900', 1], ['#3e5eb9', 3]) + PA('M8 10q7-5 14 0q-7 5-14 0z', '#fff', ' stroke="#000" stroke-width=".4"') + PA('M15 5.6q3.5 4.4 0 8.8z', '#000')],
  mg: ['Madagaskar', 'Afrika', 'Antananarivo', R(0, 0, 10, 20, '#fff') + R(10, 0, 20, 10, '#fc3d32') + R(10, 10, 20, 10, '#007e3a')],
  mu: ['Mauritius', 'Afrika', 'Port Louis', H('#ea2839', '#1a206d', '#ffd500', '#00a551')],
  km: ['Comoren', 'Afrika', 'Moroni', H('#ffc61e', '#fff', '#ce1126', '#3a75c4') + P('0,0 13,10 0,20', '#3d8e33') + CRES(4.3, 10, 3, '#fff', '#3d8e33', 1.1) + [7.8, 9.2, 10.8, 12.2].map(y => S(5.6, y, .55, '#fff')).join('')],
  sc: ['Seychellen', 'Afrika', 'Victoria', P('0,20 0,0 10,0', '#003f87') + P('0,20 10,0 20,0', '#fcd856') + P('0,20 20,0 30,0 30,6.67', '#d62828') + P('0,20 30,6.67 30,13.33', '#fff') + P('0,20 30,13.33 30,20', '#007a3d')],

  // ===================== NOORD- EN MIDDEN-AMERIKA =====================
  ca: ['Canada', 'Noord-Amerika', 'Ottawa', R(0, 0, 30, 20, '#fff') + R(0, 0, 7.5, 20, '#d52b1e') + R(22.5, 0, 7.5, 20, '#d52b1e') + PA('M15 4.5l1.2 2.4 1.6-.6-.6 3.4 1.8-1.2.5 1.2 2-.3-.9 2 .6.4-3.4 2.3.3 1.2-3-.4V17h-.2v-2.1l-3 .4.3-1.2-3.4-2.3.6-.4-.9-2 2 .3.5-1.2 1.8 1.2-.6-3.4 1.6.6z', '#d52b1e')],
  us: ['Verenigde Staten', 'Noord-Amerika', 'Washington D.C.', STRIPES(13, '#b22234', '#fff') + R(0, 0, 12, 10.77, '#3c3b6e') + Array.from({ length: 9 }, (_, r) => Array.from({ length: r % 2 ? 5 : 6 }, (_, c) => S(1 + c * 2 + (r % 2), .9 + r * 1.12, .45, '#fff')).join('')).join('')],
  gl: ['Groenland', 'Noord-Amerika', 'Nuuk', H('#fff', '#d00c33') + PA('M6 10a5 5 0 0 1 10 0z', '#d00c33') + PA('M6 10a5 5 0 0 0 10 0z', '#fff')],
  mx: ['Mexico', 'Noord-Amerika', 'Mexico-Stad', V('#006847', '#fff', '#ce1126') + PA('M13.4 11.6q1.6 1.6 3.2 0', 'none', ' stroke="#006847" stroke-width=".6"') + PA('M14 8l1.5-1.5 1.3 1-.3 2.5-1.3 1.2-1.5-1z', '#8c5a2b')],
  gt: ['Guatemala', 'Noord-Amerika', 'Guatemala-Stad', V('#4997d0', '#fff', '#4997d0') + C(15, 10, 2.6, 'none', ' stroke="#6ab04c" stroke-width=".7"') + PA('M14 9h2v2h-2z', '#e8d9a9')],
  bz: ['Belize', 'Noord-Amerika', 'Belmopan', R(0, 0, 30, 20, '#ce1126') + R(0, 1.5, 30, 17, '#003f87') + C(15, 10, 5, '#fff') + C(15, 10, 4.4, 'none', ' stroke="#2c8b2c" stroke-width=".8"')],
  sv: ['El Salvador', 'Noord-Amerika', 'San Salvador', H('#0f47af', '#fff', '#0f47af') + P('15,7.6 17.4,11.6 12.6,11.6', '#d4af37')],
  hn: ['Honduras', 'Noord-Amerika', 'Tegucigalpa', H('#00bce4', '#fff', '#00bce4') + [[15, 10], [11.5, 8.3], [11.5, 11.7], [18.5, 8.3], [18.5, 11.7]].map(([x, y]) => S(x, y, .9, '#00bce4')).join('')],
  ni: ['Nicaragua', 'Noord-Amerika', 'Managua', H('#0067c6', '#fff', '#0067c6') + P('15,7.8 17.6,12 12.4,12', '#e8b437') + C(15, 10, 2.6, 'none', ' stroke="#0067c6" stroke-width=".4"')],
  cr: ['Costa Rica', 'Noord-Amerika', 'San José', HW(['#002b7f', 1], ['#fff', 1], ['#ce1126', 2], ['#fff', 1], ['#002b7f', 1])],
  pa: ['Panama', 'Noord-Amerika', 'Panama-Stad', R(0, 0, 15, 10, '#fff') + R(15, 0, 15, 10, '#d21034') + R(0, 10, 15, 10, '#005293') + R(15, 10, 15, 10, '#fff') + S(7.5, 5, 2.4, '#005293') + S(22.5, 15, 2.4, '#d21034')],
  cu: ['Cuba', 'Noord-Amerika', 'Havana', STRIPES(5, '#002a8f', '#fff') + P('0,0 17.3,10 0,20', '#cf142b') + S(5.8, 10, 3.2, '#fff')],
  jm: ['Jamaica', 'Noord-Amerika', 'Kingston', R(0, 0, 30, 20, '#009b3a') + P('0,0 13,10 0,20', '#000') + P('30,0 17,10 30,20', '#000') + L('M0 0L30 20M30 0L0 20', '#fed100', 2.6)],
  ht: ['Haïti', 'Noord-Amerika', 'Port-au-Prince', H('#00209f', '#d21034') + R(11, 7, 8, 6, '#fff') + PA('M12.5 12h5l-1-3.5h-3z', '#016a16')],
  do: ['Dominicaanse Republiek', 'Noord-Amerika', 'Santo Domingo', R(0, 0, 30, 20, '#fff') + R(0, 0, 13, 8, '#002d62') + R(17, 12, 13, 8, '#002d62') + R(17, 0, 13, 8, '#ce1126') + R(0, 12, 13, 8, '#ce1126') + EMB(15, 9.3, 1.3, '#1b8a3a')],
  bs: ['Bahama\'s', 'Noord-Amerika', 'Nassau', H('#00778b', '#ffc72c', '#00778b') + P('0,0 13,10 0,20', '#000')],
  tt: ['Trinidad en Tobago', 'Noord-Amerika', 'Port of Spain', R(0, 0, 30, 20, '#ce1126') + P('0,0 6,0 30,17 30,20 24,20 0,3', '#fff') + P('0,0 4.4,0 30,18.2 30,20 25.6,20 0,1.8', '#000')],
  bb: ['Barbados', 'Noord-Amerika', 'Bridgetown', V('#00267f', '#ffc726', '#00267f') + PA('M15 5.5v9M12.6 7.2q0 3 2.4 3.6q2.4-.6 2.4-3.6', 'none', ' stroke="#000" stroke-width=".8"')],
  ag: ['Antigua en Barbuda', 'Noord-Amerika', 'Saint John\'s', R(0, 0, 30, 20, '#ce1126') + P('0,0 30,0 15,20', '#fff') + P('0,0 30,0 24.75,7 5.25,7', '#000') + SUN(15, 7, 2.4, '#fcd116', 14, 1.9) + P('5.25,7 24.75,7 19.5,14 10.5,14', '#0072c6')],
  dm: ['Dominica', 'Noord-Amerika', 'Roseau', R(0, 0, 30, 20, '#006b3f') + R(11.5, 0, 7, 20, '#fcd116') + R(13.8, 0, 2.4, 20, '#000') + R(16.2, 0, 2.3, 20, '#fff') + R(0, 6.5, 30, 7, '#fcd116') + R(0, 8.8, 30, 2.4, '#000') + R(0, 11.2, 30, 2.3, '#fff') + C(15, 10, 4.5, '#d41c30') + PA('M14 8.5q2-1 2.5 1l-1 3h-1z', '#006b3f')],
  lc: ['Saint Lucia', 'Noord-Amerika', 'Castries', R(0, 0, 30, 20, '#66ccff') + P('15,3 21,17 9,17', '#fff') + P('15,4.6 20,17 10,17', '#000') + P('15,10 21,17 9,17', '#fcd116')],
  vc: ['Saint Vincent en de Grenadines', 'Noord-Amerika', 'Kingstown', VW(['#002674', 1], ['#fcd116', 2], ['#009e60', 1]) + [[12.6, 7.8], [17.4, 7.8], [15, 12.2]].map(([x, y]) => P(`${x},${y - 2} ${x + 1.4},${y} ${x},${y + 2} ${x - 1.4},${y}`, '#009e60')).join('')],
  gd: ['Grenada', 'Noord-Amerika', 'Saint George\'s', R(0, 0, 30, 20, '#ce1126') + R(2.5, 2.5, 25, 15, '#007a5e') + P('2.5,2.5 27.5,2.5 15,10', '#fcd116') + P('2.5,17.5 27.5,17.5 15,10', '#fcd116') + C(15, 10, 2.4, '#ce1126') + S(15, 10, 1.4, '#fcd116') + [9, 15, 21].map(x => S(x, 1.25, .8, '#fcd116') + S(x, 18.75, .8, '#fcd116')).join('')],
  kn: ['Saint Kitts en Nevis', 'Noord-Amerika', 'Basseterre', P('0,0 30,0 0,20', '#009e49') + P('30,0 30,20 0,20', '#ce1126') + P('0,20 0,14 21,0 30,0 30,6 9,20', '#fcd116') + P('0,20 0,17 25.5,0 30,0 30,3 4.5,20', '#000') + S(11, 12.5, 1.6, '#fff', 5, .38, -125) + S(19, 7.5, 1.6, '#fff', 5, .38, -125)],
  aw: ['Aruba', 'Noord-Amerika', 'Oranjestad', R(0, 0, 30, 20, '#418fde') + R(0, 13.3, 30, 1.3, '#ffd100') + R(0, 15.9, 30, 1.3, '#ffd100') + S(4, 4, 2.6, '#ef3340', 4, .35, -90).replace('/>', ' stroke="#fff" stroke-width=".4"/>')],
  cw: ['Curaçao', 'Noord-Amerika', 'Willemstad', R(0, 0, 30, 20, '#002b7f') + R(0, 12.5, 30, 2.5, '#f9e814') + S(3.5, 3.5, 1.4, '#fff') + S(7, 6.5, 1.9, '#fff')],

  // ===================== ZUID-AMERIKA =====================
  co: ['Colombia', 'Zuid-Amerika', 'Bogotá', HW(['#fcd116', 2], ['#003893', 1], ['#ce1126', 1])],
  ve: ['Venezuela', 'Zuid-Amerika', 'Caracas', H('#ffcc00', '#00247d', '#cf142b') + Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (1.1 + i * .8 / 7); return S(15 + Math.cos(a) * 4.4, 11.8 + Math.sin(a) * 4.4, .6, '#fff'); }).join('')],
  gy: ['Guyana', 'Zuid-Amerika', 'Georgetown', R(0, 0, 30, 20, '#009e49') + P('0,0 30,10 0,20', '#fff') + P('0,.8 28,10 0,19.2', '#fcd116') + P('0,0 15,10 0,20', '#000') + P('0,1.2 13.5,10 0,18.8', '#ce1126')],
  sr: ['Suriname', 'Zuid-Amerika', 'Paramaribo', HW(['#377e3f', 2], ['#fff', 1], ['#b40a2d', 4], ['#fff', 1], ['#377e3f', 2]) + S(15, 10.2, 3, '#ecc81d')],
  ec: ['Ecuador', 'Zuid-Amerika', 'Quito', HW(['#ffdd00', 2], ['#034ea2', 1], ['#ed1c24', 1]) + EMB(15, 9, 2, '#6aa84f') + C(15, 9.4, 1.1, '#034ea2')],
  pe: ['Peru', 'Zuid-Amerika', 'Lima', V('#d91023', '#fff', '#d91023')],
  bo: ['Bolivia', 'Zuid-Amerika', 'Sucre', H('#d52b1e', '#f9e300', '#007934')],
  br: ['Brazilië', 'Zuid-Amerika', 'Brasília', R(0, 0, 30, 20, '#009c3b') + P('15,2 27.5,10 15,18 2.5,10', '#ffdf00') + C(15, 10, 4.6, '#002776') + PA('M10.6 9q4.6-1.2 8.8 1.3v.9Q15 8.8 10.5 10z', '#fff') + [[13, 12], [15.5, 13.2], [17, 12], [14, 14], [16.5, 14.4]].map(([x, y]) => C(x, y, .28, '#fff')).join('')],
  py: ['Paraguay', 'Zuid-Amerika', 'Asunción', H('#d52b1e', '#fff', '#0038a8') + C(15, 10, 2.2, 'none', ' stroke="#2a8c2a" stroke-width=".6"') + S(15, 10, .8, '#f9e300')],
  uy: ['Uruguay', 'Zuid-Amerika', 'Montevideo', STRIPES(9, '#fff', '#0038a8') + R(0, 0, 11.1, 11.1, '#fff') + SUN(5.55, 5.55, 2, '#fcd116', 16, 1.8)],
  ar: ['Argentinië', 'Zuid-Amerika', 'Buenos Aires', H('#74acdf', '#fff', '#74acdf') + SUN(15, 10, 1.5, '#f6b40e', 16, 1.6)],
  cl: ['Chili', 'Zuid-Amerika', 'Santiago', H('#fff', '#d52b1e') + R(0, 0, 10, 10, '#0039a6') + S(5, 5, 2.6, '#fff')],

  // ===================== OCEANIË =====================
  au: ['Australië', 'Oceanië', 'Canberra', R(0, 0, 30, 20, '#00008b') + UJ() + S(7.5, 15.3, 2.2, '#fff', 7, .45) + S(22.5, 16.5, 1, '#fff', 7, .45) + S(18.5, 9, 1, '#fff', 7, .45) + S(22.5, 4, 1, '#fff', 7, .45) + S(26, 8, 1, '#fff', 7, .45) + S(24.4, 10.6, .55, '#fff')],
  nz: ['Nieuw-Zeeland', 'Oceanië', 'Wellington', R(0, 0, 30, 20, '#012169') + UJ() + [[22.5, 4.5, 1], [25.6, 8.5, 1], [19.8, 9.5, .9], [22.5, 15.5, 1.1]].map(([x, y, r]) => S(x, y, r + .35, '#fff') + S(x, y, r, '#c8102e')).join('')],
  pg: ['Papoea-Nieuw-Guinea', 'Oceanië', 'Port Moresby', P('0,0 30,0 30,20', '#ce1126') + P('0,0 30,20 0,20', '#000') + PA('M17 6l3-2 3 .5 2.5-1.5-1 2.5 1 2-3-1-2 1.5z', '#fcd116') + [[6, 10.5], [4, 13.5], [8, 13.5], [6, 17], [7, 15.2]].map(([x, y], i) => S(x, y, i === 4 ? .5 : .9, '#fff')).join('')],
  fj: ['Fiji', 'Oceanië', 'Suva', R(0, 0, 30, 20, '#68bfe5') + UJ() + EMB(22.5, 9, 3.2, '#fff') + R(19.3, 6.2, 6.4, 1.6, '#ce1126')],
  sb: ['Salomonseilanden', 'Oceanië', 'Honiara', P('0,0 30,0 0,20', '#0051ba') + P('30,0 30,20 0,20', '#215b33') + L('M0 20L30 0', '#fcd116', 1.4) + [[3, 2.5], [8, 2.5], [5.5, 5], [3, 7.5], [8, 7.5]].map(([x, y]) => S(x, y, 1, '#fff')).join('')],
  vu: ['Vanuatu', 'Oceanië', 'Port Vila', R(0, 0, 30, 10, '#d21034') + R(0, 10, 30, 10, '#009543') + P('0,0 14,10 0,20', '#fdce12') + P('0,1.5 12,10 0,18.5', '#000') + R(12, 9, 18, 2, '#fdce12') + C(4.5, 10, 2.2, 'none', ' stroke="#fdce12" stroke-width=".7"')],
  ws: ['Samoa', 'Oceanië', 'Apia', R(0, 0, 30, 20, '#ce1126') + R(0, 0, 15, 10, '#002b7f') + [[7.5, 2], [10.5, 4.3], [9.3, 7.8], [5.7, 7.8], [4.6, 4.3]].map(([x, y], i) => S(x, y, i === 4 ? .7 : 1.1, '#fff')).join('')],
  to: ['Tonga', 'Oceanië', 'Nukuʻalofa', R(0, 0, 30, 20, '#c10000') + R(0, 0, 12, 10, '#fff') + R(5, 2, 2, 6, '#c10000') + R(3, 4, 6, 2, '#c10000')],
  ki: ['Kiribati', 'Oceanië', 'Tarawa', R(0, 0, 30, 10.5, '#ce1126') + R(0, 10.5, 30, 9.5, '#003f87') + SUN(15, 10.5, 3, '#fcd116', 17, 1.7) + R(0, 10.5, 30, 1, '#003f87') + [12.4, 15.2, 18].map(y => PA(`M0 ${y}q3.75-1.5 7.5 0t7.5 0 7.5 0 7.5 0v1.4q-3.75-1.5-7.5 0t-7.5 0-7.5 0-7.5 0z`, '#fff')).join('') + PA('M10 4.5q5-3 10 0l-2.5.6-2.5-1-2.5 1z', '#fcd116')],
  nr: ['Nauru', 'Oceanië', 'Yaren', R(0, 0, 30, 20, '#002b7f') + R(0, 9.2, 30, 1.6, '#ffc61e') + S(8, 14.5, 2.2, '#fff', 12, .5)],
  mh: ['Marshalleilanden', 'Oceanië', 'Majuro', R(0, 0, 30, 20, '#003893') + P('0,20 30,2 30,6', '#fff') + P('0,20 30,6 30,10', '#dd7500') + S(6, 6, 3, '#fff', 24, .45)],
  fm: ['Micronesia', 'Oceanië', 'Palikir', R(0, 0, 30, 20, '#75b2dd') + [[15, 5.5], [15, 14.5], [10.5, 10], [19.5, 10]].map(([x, y]) => S(x, y, 1.8, '#fff')).join('')],
  pw: ['Palau', 'Oceanië', 'Ngerulmud', R(0, 0, 30, 20, '#4aadd6') + C(13, 10, 5.5, '#ffde00')],
};
for (const k of Object.keys(F)) if (!F[k]) delete F[k];
window.FLAGS = F;
window.CONTINENTS = ['Europa', 'Azië', 'Afrika', 'Noord-Amerika', 'Zuid-Amerika', 'Oceanië'];
window.flagSVG = (code, attrs = '') => `<svg viewBox="0 0 30 20" preserveAspectRatio="none" ${attrs}>${F[code][3]}</svg>`;
})();
