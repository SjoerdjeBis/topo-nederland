// Bouwt map-data.js (SVG-paden) voor Topo Nederland uit CBS/PDOK, OSM en Natural Earth.
// Gebruik:  cd tools && npm install && node build-map.js
// Brondata wordt gedownload naar tools/data/ (alleen als die er nog niet is).
const path = require('path');
const turf = require('@turf/turf');
const osm2g = require('osmtogeojson');
const { execSync } = require('child_process');
const { DATA, download, read, rd, toRD, projector, cleanPoly, pArea, writeData } = require('./geo');

const OUT = path.join(__dirname, '..', 'map-data.js');
const SOURCES = {
  'pdok_prov.json': 'https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?service=WFS&version=2.0.0&request=GetFeature&typeNames=gebiedsindelingen:provincie_gegeneraliseerd&outputFormat=application/json&srsName=EPSG:28992',
  'ne_countries.geojson': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson',
  'osm.json': 'osm-query-main.overpassql',
  'osm_w.json': 'osm-query-waters.overpassql',
  'osm3.json': 'osm-query-links.overpassql',
  'osm5.json': 'osm-query-rhine.overpassql',
};

download(SOURCES).then(build).catch(e => { console.error(e); process.exit(1); });

function build() {

// Viewport in RD-meters en schaal (meters per SVG-eenheid)
const X0 = 8000, X1 = 282000, Y0 = 303000, Y1 = 625000, M = 400;
const W = (X1 - X0) / M, H = (Y1 - Y0) / M;

const { sv, geomPath } = projector({ X0, Y1, M });

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
// Omtrek van heel Nederland, voor kustrand en schaduw
out.land = geomPath(land.geometry, 0.5);


// ---------- Buurlanden (Natural Earth), geclipt op viewport
const bboxLL = [2.9, 50.4, 7.9, 53.9];
const ne = read('ne_countries.geojson');
const nb = ne.features.filter(f => ['DEU', 'BEL'].includes(f.properties.ADM0_A3));
const nbRD = nb.map(f => toRD(cleanPoly(turf.bboxClip(f, bboxLL))));
out.neighbors = nbRD.map(f => geomPath(f.geometry, 0.5)).join('');

// ---------- Wateren (OSM), geclipt: alles wat onder land valt eraf
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
// Alleen het grootste aaneengesloten stuk houden: OSM kent ook sloten die 'Waal' heten
function mainNetwork(lines) {
  const key = p => p.map(v => Math.round(v)).join(',');
  const parent = lines.map((_, i) => i);
  const find = i => parent[i] === i ? i : (parent[i] = find(parent[i]));
  const byVertex = new Map();
  lines.forEach((l, i) => l.forEach(p => {
    const k = key(p);
    if (!byVertex.has(k)) byVertex.set(k, []);
    byVertex.get(k).push(i);
  }));
  for (const ids of byVertex.values()) for (const j of ids) parent[find(j)] = find(ids[0]);
  const len = l => l.slice(1).reduce((a, p, j) => a + Math.hypot(p[0] - l[j][0], p[1] - l[j][1]), 0);
  const total = new Map();
  lines.forEach((l, i) => total.set(find(i), (total.get(find(i)) || 0) + len(l)));
  const best = [...total.entries()].sort((a, b) => b[1] - a[1])[0][0];
  // Stukken die door een sluis of brug los liggen, maar dichtbij, horen er ook bij
  const keep = new Set([best]);
  const near = (a, b) => a.some(p => b.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1000));
  let grew = true;
  while (grew) {
    grew = false;
    for (const root of total.keys()) {
      if (keep.has(root)) continue;
      const mine = lines.filter((_, i) => find(i) === root).flat();
      const kept = lines.filter((_, i) => keep.has(find(i))).flat();
      if (near(mine, kept)) { keep.add(root); grew = true; }
    }
  }
  return lines.filter((_, i) => keep.has(find(i)));
}
for (const [k, names] of Object.entries(riverNames)) {
  const lines = og.filter(f => f.id.startsWith('way/') && names.includes(f.properties.name) && f.geometry.type === 'LineString').map(toRD);
  const ml = { type: 'MultiLineString', coordinates: mainNetwork(lines.map(l => l.geometry.coordinates)) };
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
writeData(OUT, 'MAP_DATA', out, ['// Gegenereerd door tools/build-map.js, niet met de hand aanpassen.',
  '// Bronnen: CBS/PDOK gebiedsindelingen (CC BY 4.0), © OpenStreetMap-bijdragers (ODbL), Natural Earth (publiek domein).',
  '// Coördinaten: RD (EPSG:28992), 1 eenheid = ' + M + ' m.']);
}
