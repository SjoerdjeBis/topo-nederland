// Mockup-vlaggen als inline SVG (viewBox 0 0 30 20).
// In de echte versie komt hier een complete set (bijv. flag-icons, MIT) lokaal meegeleverd.
const H3 = (a, b, c) => `<rect width="30" height="20" fill="${a}"/><rect y="6.67" width="30" height="6.67" fill="${b}"/><rect y="13.33" width="30" height="6.67" fill="${c}"/>`;
const V3 = (a, b, c) => `<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
const NORDIC = (bg, cross, inner) => `<rect width="30" height="20" fill="${bg}"/><rect x="8" width="${inner ? 5 : 3}" height="20" fill="${cross}" transform="translate(${inner ? -1 : 0})"/><rect y="${inner ? 7.5 : 8.5}" width="30" height="${inner ? 5 : 3}" fill="${cross}"/>${inner ? `<rect x="8.25" width="2.5" height="20" fill="${inner}"/><rect y="8.75" width="30" height="2.5" fill="${inner}"/>` : ''}`;

const FLAGS = {
  nl: { name: 'Nederland',     cont: 'Europa', svg: H3('#ae1c28', '#fff', '#21468b') },
  be: { name: 'België',        cont: 'Europa', svg: V3('#000', '#fdda24', '#ef3340') },
  de: { name: 'Duitsland',     cont: 'Europa', svg: H3('#000', '#dd0000', '#ffce00') },
  fr: { name: 'Frankrijk',     cont: 'Europa', svg: V3('#002395', '#fff', '#ed2939') },
  it: { name: 'Italië',        cont: 'Europa', svg: V3('#009246', '#fff', '#ce2b37') },
  ie: { name: 'Ierland',       cont: 'Europa', svg: V3('#169b62', '#fff', '#ff883e') },
  at: { name: 'Oostenrijk',    cont: 'Europa', svg: H3('#ed2939', '#fff', '#ed2939') },
  hu: { name: 'Hongarije',     cont: 'Europa', svg: H3('#cd2a3e', '#fff', '#436f4d') },
  ee: { name: 'Estland',       cont: 'Europa', svg: H3('#0072ce', '#000', '#fff') },
  lt: { name: 'Litouwen',      cont: 'Europa', svg: H3('#fdb913', '#006a44', '#c1272d') },
  pl: { name: 'Polen',         cont: 'Europa', svg: '<rect width="30" height="20" fill="#fff"/><rect y="10" width="30" height="10" fill="#dc143c"/>' },
  ua: { name: 'Oekraïne',      cont: 'Europa', svg: '<rect width="30" height="20" fill="#0057b7"/><rect y="10" width="30" height="10" fill="#ffd700"/>' },
  se: { name: 'Zweden',        cont: 'Europa', svg: NORDIC('#006aa7', '#fecc00') },
  dk: { name: 'Denemarken',    cont: 'Europa', svg: NORDIC('#c8102e', '#fff') },
  fi: { name: 'Finland',       cont: 'Europa', svg: NORDIC('#fff', '#002f6c') },
  no: { name: 'Noorwegen',     cont: 'Europa', svg: NORDIC('#ba0c2f', '#fff', '#00205b') },
  is: { name: 'IJsland',       cont: 'Europa', svg: NORDIC('#02529c', '#fff', '#dc1e35') },
  ch: { name: 'Zwitserland',   cont: 'Europa', svg: '<rect width="30" height="20" fill="#da291c"/><rect x="13" y="4" width="4" height="12" fill="#fff"/><rect x="9" y="8" width="12" height="4" fill="#fff"/>' },
  gr: { name: 'Griekenland',   cont: 'Europa', svg: '<rect width="30" height="20" fill="#0d5eaf"/>' + [1,3,5,7].map(i => `<rect y="${i*2.22}" width="30" height="2.22" fill="#fff"/>`).join('') + '<rect width="11.1" height="11.1" fill="#0d5eaf"/><rect x="4.44" width="2.22" height="11.1" fill="#fff"/><rect y="4.44" width="11.1" height="2.22" fill="#fff"/>' },
  jp: { name: 'Japan',         cont: 'Azië',   svg: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>' },
  bd: { name: 'Bangladesh',    cont: 'Azië',   svg: '<rect width="30" height="20" fill="#006a4e"/><circle cx="13.5" cy="10" r="5.5" fill="#f42a41"/>' },
  in: { name: 'India',         cont: 'Azië',   svg: H3('#ff9933', '#fff', '#138808') + '<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".6"/>' },
  th: { name: 'Thailand',      cont: 'Azië',   svg: '<rect width="30" height="20" fill="#a51931"/><rect y="3.33" width="30" height="13.33" fill="#f4f5f8"/><rect y="6.67" width="30" height="6.67" fill="#2d2a4a"/>' },
  id: { name: 'Indonesië',     cont: 'Azië',   svg: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="10" fill="#ce1126"/>' },
  ng: { name: 'Nigeria',       cont: 'Afrika', svg: V3('#008751', '#fff', '#008751') },
  ml: { name: 'Mali',          cont: 'Afrika', svg: V3('#14b53a', '#fcd116', '#ce1126') },
  gn: { name: 'Guinee',        cont: 'Afrika', svg: V3('#ce1126', '#fcd116', '#009460') },
  ga: { name: 'Gabon',         cont: 'Afrika', svg: H3('#009e60', '#fcd116', '#3a75c4') },
  bw: { name: 'Botswana',      cont: 'Afrika', svg: '<rect width="30" height="20" fill="#75aadb"/><rect y="7.5" width="30" height="5" fill="#fff"/><rect y="8.5" width="30" height="3" fill="#000"/>' },
  co: { name: 'Colombia',      cont: 'Zuid-Amerika', svg: '<rect width="30" height="20" fill="#ce1126"/><rect width="30" height="15" fill="#003893"/><rect width="30" height="10" fill="#fcd116"/>' },
  pe: { name: 'Peru',          cont: 'Zuid-Amerika', svg: V3('#d91023', '#fff', '#d91023') },
  ar: { name: 'Argentinië',    cont: 'Zuid-Amerika', svg: H3('#74acdf', '#fff', '#74acdf') + '<circle cx="15" cy="10" r="2" fill="#f6b40e"/>' },
  ca: { name: 'Canada',        cont: 'Noord-Amerika', svg: '<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#d52b1e"/><rect x="22.5" width="7.5" height="20" fill="#d52b1e"/><path d="M15 4.5l1.2 2.4 1.6-.6-.6 3.4 1.8-1.2.5 1.2 2-.3-.9 2 .6.4-3.4 2.3.3 1.2-3-.4V17h-.2v-2.1l-3 .4.3-1.2-3.4-2.3.6-.4-.9-2 2 .3.5-1.2 1.8 1.2-.6-3.4 1.6.6z" fill="#d52b1e"/>' },
  mx: { name: 'Mexico',        cont: 'Noord-Amerika', svg: V3('#006847', '#fff', '#ce1126') + '<circle cx="15" cy="10" r="2" fill="#8c5a2b"/>' },
  au: { name: 'Australië',     cont: 'Oceanië', svg: '<rect width="30" height="20" fill="#00008b"/><rect width="15" height="10" fill="#00008b"/><path d="M0 0l15 10M15 0L0 10" stroke="#fff" stroke-width="2"/><path d="M7.5 0v10M0 5h15" stroke="#fff" stroke-width="3"/><path d="M7.5 0v10M0 5h15" stroke="#c8102e" stroke-width="1.6"/>' + [[22,4],[25,9],[19,10],[22,16],[7.5,15.5]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="${x===7.5?1.6:.9}" fill="#fff"/>`).join('') },
  nz: { name: 'Nieuw-Zeeland', cont: 'Oceanië', svg: '<rect width="30" height="20" fill="#012169"/><path d="M0 0l15 10M15 0L0 10" stroke="#fff" stroke-width="2"/><path d="M7.5 0v10M0 5h15" stroke="#fff" stroke-width="3"/><path d="M7.5 0v10M0 5h15" stroke="#c8102e" stroke-width="1.6"/>' + [[23,4],[26,8.5],[20.5,9.5],[23,16]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#c8102e" stroke="#fff" stroke-width=".4"/>`).join('') },
};

// Volgorde waarin de reis de wereld verkent: eerst de buren, dan steeds verder weg.
const ROUTE = ['be','de','fr','it','ie','at','pl','se','dk','ch','no','fi','is','gr','hu','ee','lt','ua','jp','in','th','id','bd','ng','ml','gn','ga','bw','co','pe','ar','ca','mx','au','nz'];

function flagSVG(code, extra = '') {
  return `<svg viewBox="0 0 30 20" preserveAspectRatio="none" ${extra}>${FLAGS[code].svg}</svg>`;
}
