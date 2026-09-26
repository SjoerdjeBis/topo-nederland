// Bouwt map-data.js (SVG-paden) voor Topo Nederland uit CBS/PDOK, OSM en Natural Earth.
// Gebruik:  cd tools && npm install && node build-map.js
// Brondata wordt gedownload naar tools/data/ (alleen als die er nog niet is).
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const osm2g = require('osmtogeojson');
const { execSync } = require('child_process');

const DATA = path.join(__dirname, 'data');
const OUT = path.join(__dirname, '..', 'map-data.js');
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const SOURCES = {
  'pdok_prov.json': 'https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?service=WFS&version=2.0.0&request=GetFeature&typeNames=gebiedsindelingen:provincie_gegeneraliseerd&outputFormat=application/json&srsName=EPSG:28992',
  'ne_countries.geojson': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson',
  'osm.json': 'osm-query-main.overpassql',
  'osm_w.json': 'osm-query-waters.overpassql',
  'osm3.json': 'osm-query-links.overpassql',
  'osm5.json': 'osm-query-rhine.overpassql',
};
async function download() {
  fs.mkdirSync(DATA, { recursive: true });
  for (const [file, src] of Object.entries(SOURCES)) {
    const dest = path.join(DATA, file);
    if (fs.existsSync(dest)) continue;
    console.log('download', file);
    const res = src.startsWith('http')
      ? await fetch(src)
      : await fetch(OVERPASS, { method: 'POST', headers: { 'User-Agent': 'topo-nederland-map-builder' },
          body: new URLSearchParams({ data: fs.readFileSync(path.join(__dirname, src), 'utf8') }) });
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
}
const read = f => JSON.parse(fs.readFileSync(path.join(DATA, f)));

download().then(build).catch(e => { console.error(e); process.exit(1); });

function build() {

// Viewport in RD-meters en schaal (meters per SVG-eenheid)
const X0 = 8000, X1 = 282000, Y0 = 303000, Y1 = 625000, M = 400;
const W = (X1 - X0) / M, H = (Y1 - Y0) / M;

// WGS84 -> RD (benadering Schreutelkamp & Strang van Hees, ~1 m nauwkeurig)
const R = [[0,1,190094.945],[1,1,-11832.228],[2,1,-114.221],[0,3,-32.391],[1,0,-0.705],[3,1,-2.340],[1,3,-0.608],[0,2,-0.008],[2,3,0.148]];
const S = [[1,0,309056.544],[0,2,3638.893],[2,0,73.077],[1,2,-157.984],[3,0,59.788],[0,1,0.433],[2,2,-6.439],[1,1,-0.032],[0,4,0.092],[1,4,-0.054]];
function rd([lon, lat]) {
  const dF = 0.36 * (lat - 52.15517440), dL = 0.36 * (lon - 5.38720621);
  let x = 155000, y = 463000;
  for (const [p, q, r] of R) x += r * dF ** p * dL ** q;
  for (const [p, q, s] of S) y += s * dF ** p * dL ** q;
  return [x, y];
}
const mapCoords = (geom, fn) => {
  const walk = c => typeof c[0] === 'number' ? fn(c) : c.map(walk);
  return { type: geom.type, coordinates: walk(geom.coordinates) };
};
const toRD = f => ({ ...f, geometry: mapCoords(f.geometry, rd) });

// Douglas-Peucker in SVG-eenheden
function dp(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const sv = ([x, y]) => [(x - X0) / M, (Y1 - y) / M];
const fmt = n => (Math.round(n * 10) / 10).toString();
function ringPath(ring, eps, closed) {
  let pts = ring.map(sv);
  if (closed) {
    let k = 0, md = -1;
    pts.forEach(([x, y], i) => { const d = Math.hypot(x - pts[0][0], y - pts[0][1]); if (d > md) { md = d; k = i; } });
    pts = [...dp(pts.slice(0, k + 1), eps), ...dp(pts.slice(k), eps).slice(1)];
  } else pts = dp(pts, eps);
  if (closed && pts.length < 4) return '';
  return 'M' + pts.map(([x, y]) => fmt(x) + ' ' + fmt(y)).join('L') + (closed ? 'Z' : '');
}
function geomPath(g, eps = 0.35) {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : null;
  if (polys) return polys.flatMap(p => p.map(r => ringPath(r, eps, true))).join('');
  const lines = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
  return lines.map(l => ringPath(l, eps, false)).join('');
}

// ---------- Provincies (RD) met topologie-bewuste vereenvoudiging via mapshaper
const run = cmd => execSync(cmd, { stdio: 'inherit', cwd: DATA });
run('npx mapshaper pdok_prov.json -simplify interval=200 keep-shapes -filter-islands min-area=400000 remove-empty -o format=geojson precision=1 prov_s.json force');
run('npx mapshaper prov_s.json -dissolve -o format=geojson land.json force');
const prov = read('prov_s.json');
const lj = read('land.json');
const land = lj.features ? lj.features[0] : turf.feature(lj.geometries ? lj.geometries[0] : lj);
const provIds = { 'Groningen': 'groningen', 'Fryslân': 'friesland', 'Drenthe': 'drenthe', 'Overijssel': 'overijssel', 'Flevoland': 'flevoland', 'Gelderland': 'gelderland', 'Utrecht': 'utrecht', 'Noord-Holland': 'noord-holland', 'Zuid-Holland': 'zuid-holland', 'Zeeland': 'zeeland', 'Noord-Brabant': 'noord-brabant', 'Limburg': 'limburg' };
const out = { viewBox: `0 0 ${W} ${H}`, provinces: {}, waters: {}, rivers: {}, cities: {}, neighbors: '' };
for (const f of prov.features) out.provinces[provIds[f.properties.statnaam]] = geomPath(f.geometry, 0.3);


// ---------- Buurlanden (Natural Earth), geclipt op viewport
const bboxLL = [2.9, 50.4, 7.9, 53.9];
const ne = read('ne_countries.geojson');
const nb = ne.features.filter(f => ['DEU', 'BEL'].includes(f.properties.ADM0_A3));
const cleanPoly = f => {
  const polys = (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
    .map(p => p.filter(r => r.length >= 4)).filter(p => p.length);
  return turf.feature({ type: 'MultiPolygon', coordinates: polys });
};
const nbRD = nb.map(f => toRD(cleanPoly(turf.bboxClip(f, bboxLL))));
out.neighbors = nbRD.map(f => geomPath(f.geometry, 0.5)).join('');

// ---------- Wateren (OSM), geclipt: alles wat onder land valt eraf
const pArea = p => p.geometry.coordinates.reduce((a, r, i) => { let s = 0; for (let j = 0; j < r.length - 1; j++) s += r[j][0] * r[j + 1][1] - r[j + 1][0] * r[j][1]; return a + (i ? -1 : 1) * Math.abs(s / 2); }, 0);
const vp = turf.bboxPolygon([X0, Y0, X1, Y1]);
const landAll = turf.union(turf.featureCollection([land, ...nbRD]));
const ow = osm2g(read('osm_w.json')).features.filter(f => f.id.startsWith('relation'));
const byId = id => toRD(ow.find(f => f.id === id));
const waterSrc = {
  ijsselmeer: byId('relation/945096'),
  markermeer: byId('relation/49368'),
  oosterschelde: byId('relation/6846427'),
  waddenzee: byId('relation/5909370'),
};
const waterGeo = {};
for (const [k, f] of Object.entries(waterSrc)) {
  const clipped = turf.difference(turf.featureCollection([turf.intersect(turf.featureCollection([f, vp])), land]));
  waterGeo[k] = clipped;
  out.waters[k] = geomPath(clipped.geometry, 0.3);
}
// Biesbosch ligt op land (natuurgebied met kreken): tekenen we als overlay
out.waters.biesbosch = geomPath(byId('relation/14616038').geometry, 0.3);

// Noordzee = zee-deel van de viewport dat aan de open zee grenst, min de andere wateren
let sea = turf.difference(turf.featureCollection([vp, landAll]));
for (const k of ['waddenzee', 'oosterschelde']) sea = turf.difference(turf.featureCollection([sea, waterGeo[k]]));
const parts = (sea.geometry.type === 'MultiPolygon' ? sea.geometry.coordinates : [sea.geometry.coordinates]).map(c => turf.polygon(c));
parts.sort((a, b) => pArea(b) - pArea(a));
// Westerschelde = zee oostelijk van de lijn Vlissingen-Breskens
const wsBox = toRD(turf.polygon([[[3.555, 51.47], [4.45, 51.47], [4.45, 51.25], [3.54, 51.25], [3.555, 51.47]]]));
const westerschelde = turf.intersect(turf.featureCollection([parts[0], wsBox]));
out.waters.westerschelde = geomPath(westerschelde.geometry, 0.3);
const nzParts = turf.difference(turf.featureCollection([parts[0], wsBox]));
const nzList = (nzParts.geometry.type === 'MultiPolygon' ? nzParts.geometry.coordinates : [nzParts.geometry.coordinates]).map(c => turf.polygon(c)).sort((a, b) => pArea(b) - pArea(a));
const noordzee = nzList[0];
out.waters.noordzee = geomPath(noordzee.geometry, 0.4);
// Binnenwater (Haringvliet, randmeren, ...) = overige zee-stukken: neutraal, niet klikbaar
const nbVerts = new Set(nbRD.flatMap(f => f.geometry.coordinates.flat(2).map(c => c.map(Math.round).join(','))));
const nbShare = p => { const v = p.geometry.coordinates.flat(1); return v.filter(c => nbVerts.has(c.map(Math.round).join(','))).length / v.length; };
out.innerWater = parts.slice(1).filter(p => pArea(p) > 300000 && nbShare(p) < 0.1).map(p => geomPath(p.geometry, 0.3)).join('');

// ---------- Rivieren (OSM-lijnen)
const og = ['osm.json', 'osm3.json', 'osm5.json'].flatMap(f => osm2g(read(f)).features);
const riverNames = { maas: ['Maas', 'Bergsche Maas'], waal: ['Waal'], nederrijn: ['Nederrijn'], lek: ['Lek'], ijssel: ['IJssel'], noordzeekanaal: ['Noordzeekanaal'], 'amsterdam-rijnkanaal': ['Amsterdam-Rijnkanaal'], 'nieuwe-waterweg': ['Nieuwe Waterweg', 'Scheur'] };
for (const [k, names] of Object.entries(riverNames)) {
  const lines = og.filter(f => f.id.startsWith('way/') && names.includes(f.properties.name) && f.geometry.type === 'LineString').map(toRD);
  const ml = { type: 'MultiLineString', coordinates: lines.map(l => l.geometry.coordinates) };
  out.rivers[k] = geomPath(ml, 0.5);
}

// Verbindende rivierstukken (niet in de quiz), zodat het netwerk klopt
const linkNames = ['Boven-Rijn', 'Rhein', 'Bijlandsch Kanaal', 'Pannerdensch Kanaal', 'Nieuwe Maas', 'Noord', 'Beneden-Merwede', 'Boven-Merwede', 'Nieuwe Merwede', 'Oude Maas', 'Amer'];
const links = og.filter(f => f.id.startsWith('way/') && linkNames.includes(f.properties.name) && f.geometry.type === 'LineString' && !(f.properties.name === 'Oude Maas' && f.geometry.coordinates[0][0] > 4.7)).map(toRD);
const vpClip = l => turf.bboxClip(l, [X0, Y0, X1, Y1]);
out.riverLinks = geomPath({ type: 'MultiLineString', coordinates: links.map(l => vpClip(l).geometry).flatMap(g => g.type === 'LineString' ? [g.coordinates] : g.coordinates).filter(c => c.length > 1) }, 0.5);

// ---------- Steden
for (const f of og.filter(f => f.id.startsWith('node/'))) out.cities[f.properties.name] = sv(rd(f.geometry.coordinates)).map(n => +n.toFixed(1));


// ---------- map-data.js voor de site
const lines = ['// Gegenereerd door tools/build-map.js, niet met de hand aanpassen.',
  '// Bronnen: CBS/PDOK gebiedsindelingen (CC BY 4.0), © OpenStreetMap-bijdragers (ODbL), Natural Earth (publiek domein).',
  '// Coördinaten: RD (EPSG:28992), 1 eenheid = ' + M + ' m.',
  'const MAP_DATA = {'];
const entry = (k, v, ind) => `${ind}${JSON.stringify(k)}: ${JSON.stringify(v)},`;
for (const [k, v] of Object.entries(out)) {
  if (typeof v === 'string') lines.push(entry(k, v, '  '));
  else { lines.push(`  ${JSON.stringify(k)}: {`); for (const [k2, v2] of Object.entries(v)) lines.push(entry(k2, v2, '    ')); lines.push('  },'); }
}
lines.push('};', '');
fs.writeFileSync(OUT, lines.join('\n'));
console.log('geschreven:', OUT);
}
