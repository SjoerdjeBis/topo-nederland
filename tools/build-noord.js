// Bouwt map-data-noord.js: ingezoomde kaart van Groningen, Friesland en Drenthe
// (Waddeneilanden en steden) voor de toets "Noord-Nederland".
// Gebruik:  cd tools && npm install && node build-noord.js
const path = require('path');
const turf = require('@turf/turf');
const { execSync } = require('child_process');
const osm2g = require('osmtogeojson');
const { DATA, download, read, rd, toRD, projector, cleanPoly, writeData } = require('./geo');

const OUT = path.join(__dirname, '..', 'map-data-noord.js');
const SOURCES = {
  'pdok_prov.json': 'https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?service=WFS&version=2.0.0&request=GetFeature&typeNames=gebiedsindelingen:provincie_gegeneraliseerd&outputFormat=application/json&srsName=EPSG:28992',
  'ne_countries.geojson': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson',
  'osm_noord.json': 'osm-query-noord.overpassql',
  'osm_w.json': 'osm-query-waters.overpassql',
};

download(SOURCES).then(build).catch(e => { console.error(e); process.exit(1); });

function build() {
  // Viewport in RD-meters: van Vlieland tot de Duitse grens, van Rottumeroog tot zuid-Drenthe
  const X0 = 115000, X1 = 284000, Y0 = 508000, Y1 = 625000, M = 250;
  const W = (X1 - X0) / M, H = (Y1 - Y0) / M;
  const { geomPath, point, sv } = projector({ X0, Y1, M });
  const clipBox = [X0 - 5000, Y0 - 5000, X1 + 5000, Y1 + 5000];

  const run = cmd => execSync(cmd, { stdio: 'inherit', cwd: DATA });
  run('npx mapshaper pdok_prov.json -simplify interval=90 keep-shapes -filter-islands min-area=150000 remove-empty -o format=geojson precision=1 prov_noord.json force');
  const prov = read('prov_noord.json');
  const clip = f => cleanPoly(turf.bboxClip(f, clipBox));
  const hasArea = f => f.geometry.coordinates.length > 0;

  const provIds = { 'Groningen': 'groningen', 'Fryslân': 'friesland', 'Drenthe': 'drenthe', 'Overijssel': 'overijssel', 'Flevoland': 'flevoland', 'Noord-Holland': 'noord-holland' };
  const out = { viewBox: `0 0 ${W} ${H}`, provinces: {}, islands: {}, islandLabels: {}, waters: {}, cities: {}, labels: {} };
  const clipped = [];
  for (const f of prov.features) {
    const id = provIds[f.properties.statnaam];
    if (!id) continue;
    const c = clip(f);
    if (!hasArea(c)) continue;
    clipped.push(c);
    out.provinces[id] = geomPath(c.geometry, 0.3);
  }
  const landGeo = turf.union(turf.featureCollection(clipped));
  out.land = geomPath(landGeo.geometry, 0.4);

  // Waddenzee en IJsselmeer (OSM), alleen het deel dat niet onder land valt
  const vp = turf.bboxPolygon([X0, Y0, X1, Y1]);
  const ow = osm2g(read('osm_w.json')).features.filter(f => f.id.startsWith('relation'));
  const waterIds = { waddenzee: 'relation/5909370', ijsselmeer: 'relation/945096' };
  for (const [k, id] of Object.entries(waterIds)) {
    const f = toRD(ow.find(x => x.id === id));
    const inView = turf.intersect(turf.featureCollection([f, vp]));
    out.waters[k] = geomPath(turf.difference(turf.featureCollection([inView, landGeo])).geometry, 0.3);
  }

  // Afsluitdijk: Den Oever - Breezanddijk - Kornwerderzand - Zurich
  const dike = [[5.0436, 52.9365], [5.2000, 53.0120], [5.3355, 53.0715], [5.3950, 53.1050]].map(rd);
  out.afsluitdijk = geomPath({ type: 'LineString', coordinates: dike }, 0.2);
  const [a, b] = [dike[0], dike[2]].map(sv);
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  const mid = sv(dike[1]);
  // Naam iets ten noordwesten van de dijk, in de Waddenzee
  out.labels.Afsluitdijk = [+(mid[0] - 6).toFixed(1), +(mid[1] - 8).toFixed(1), +angle.toFixed(1)];

  // Waddeneilanden: de losse delen van de provincie-polygonen waar het eiland in ligt
  const islandPoints = {
    vlieland: [5.07, 53.297], terschelling: [5.33, 53.40],
    ameland: [5.76, 53.45], schiermonnikoog: [6.20, 53.48],
  };
  const parts = prov.features.flatMap(f =>
    (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map(c => turf.polygon(c)));
  for (const [id, ll] of Object.entries(islandPoints)) {
    const pt = turf.point(toRD(turf.point(ll)).geometry.coordinates);
    const part = parts.find(p => turf.booleanPointInPolygon(pt, p));
    if (!part) throw new Error('Eiland niet gevonden: ' + id);
    out.islands[id] = geomPath(part.geometry, 0.25);
    // Naam net onder het eiland, in de Waddenzee
    const bb = turf.bbox(part);
    out.islandLabels[id] = sv([(bb[0] + bb[2]) / 2, bb[1] - 2600]).map(n => +n.toFixed(1));
  }

  // Duitsland (Natural Earth), alleen het stuk dat in beeld komt
  const ne = read('ne_countries.geojson');
  const de = ne.features.find(f => f.properties.ADM0_A3 === 'DEU');
  out.neighbors = geomPath(clip(toRD(cleanPoly(turf.bboxClip(de, [4.5, 52.2, 7.9, 53.9])))).geometry, 0.5);

  // Steden (OSM place-nodes)
  for (const e of read('osm_noord.json').elements) out.cities[e.tags.name] = point([e.lon, e.lat]);
  const missing = ['Groningen', 'Leeuwarden', 'Assen', 'Delfzijl', 'Veendam', 'Emmen', 'Hoogeveen', 'Meppel', 'Drachten', 'Heerenveen', 'Sneek']
    .filter(n => !out.cities[n]);
  if (missing.length) throw new Error('Steden ontbreken: ' + missing.join(', '));

  // Plaatsen voor namen op de kaart (lengte, breedte)
  const labels = {
    'GRONINGEN': [6.60, 53.36], 'FRIESLAND': [5.78, 53.07], 'DRENTHE': [6.62, 52.90],
    'Waddenzee': [5.68, 53.335], 'IJsselmeer': [5.30, 52.86], 'Noordzee': [5.55, 53.57],
  };
  for (const [k, ll] of Object.entries(labels)) out.labels[k] = point(ll);

  writeData(OUT, 'MAP_DATA_NOORD', out, ['// Gegenereerd door tools/build-noord.js, niet met de hand aanpassen.',
    '// Bronnen: CBS/PDOK gebiedsindelingen (CC BY 4.0), © OpenStreetMap-bijdragers (ODbL), Natural Earth (publiek domein).',
    '// Coördinaten: RD (EPSG:28992), 1 eenheid = ' + M + ' m.']);
}
