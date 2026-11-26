// Bouwt world-data.js: een wereldkaart (Natural Earth, publiek domein) met één SVG-pad per land.
// Gebruik: node build-world.js [percentage]   (standaard 10%)
//
// Per land (ISO-code, kleine letters):
//   d    SVG-pad in relatieve coördinaten (compact)
//   bb   [x, y, b, h] van het hoofdgebied (voor de vlag-vulling, zonder verre eilanden)
//   c    [x, y] middelpunt van het hoofdgebied op de kaart
//   ll   [lon, lat] middelpunt van het hoofdgebied (voor afstanden)
//   tiny true als het land op de wereldkaart te klein is om te zien (krijgt een stip)
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const d3 = require('d3-geo');
const turf = require('@turf/turf');

const PCT = process.argv[2] || '10%';
const tmp = path.join(os.tmpdir(), 'ne_world_simpl.json');
execFileSync(path.join(__dirname, 'node_modules/.bin/mapshaper'), [
  '-i', path.join(__dirname, 'data/ne_countries.geojson'),
  '-filter', 'ISO_A2_EH != "AQ" && ISO_A2_EH != "TF" && ISO_A2_EH != "HM" && ISO_A2_EH != "GS"',
  // Gebieden zonder eigen code bij hun land voegen, en de Krim bij Oekraïne (zoals in de Bosatlas)
  '-each', `ISO_A2_EH = ({ESB:'CY',CYN:'CY',CNM:'CY',WSB:'CY',SOL:'SO',USG:'CU',SPI:'CL'})[ADM0_A3] || ISO_A2_EH`,
  '-filter-fields', 'ISO_A2_EH',
  '-explode',
  '-each', 'if (ISO_A2_EH == "RU" && this.centroidX > 32 && this.centroidX < 36.8 && this.centroidY > 44 && this.centroidY < 46.3) ISO_A2_EH = "UA"',
  '-dissolve', 'ISO_A2_EH',
  '-simplify', PCT, 'weighted', 'keep-shapes',
  '-filter-slivers', 'min-area=2km2',
  '-o', 'format=geojson', 'precision=0.001', tmp,
], { stdio: 'inherit' });

const geo = JSON.parse(fs.readFileSync(tmp, 'utf8'));
// d3-geo verwacht buitenringen met de klok mee; GeoJSON (RFC 7946) levert ze andersom.
geo.features = geo.features.filter(f => f.geometry).map(f => turf.rewind(f, { reverse: true }));

const W = 1000, H = 507;
const proj = d3.geoNaturalEarth1().fitExtent([[2, 2], [W - 2, H - 2]], { type: 'Sphere' });

// Compact pad: eerste punt absoluut, daarna relatief, 1 decimaal.
const fmt = v => { const s = (Math.round(v * 10) / 10).toString(); return s.replace(/^0\./, '.').replace(/^-0\./, '-.'); };
function encode(geom) {
  let out = '';
  const stream = {
    pts: null,
    point(x, y) { this.pts.push([x, y]); },
    lineStart() { this.pts = []; },
    lineEnd() {
      const p = this.pts.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
      const q = p.filter((pt, i) => i === 0 || pt[0] !== p[i - 1][0] || pt[1] !== p[i - 1][1]);
      if (q.length < 3) return;
      out += 'M' + fmt(q[0][0]) + ' ' + fmt(q[0][1]) + 'l';
      const parts = [];
      for (let i = 1; i < q.length; i++) {
        const dx = q[i][0] - q[i - 1][0], dy = q[i][1] - q[i - 1][1];
        parts.push(fmt(dx) + ' ' + fmt(dy));
      }
      out += parts.join(' ').replace(/ -/g, '-') + 'z';
    },
    polygonStart() {}, polygonEnd() {}, sphere() {},
  };
  d3.geoStream(geom, proj.stream(stream));
  return out;
}

const byIso = {};
for (const f of geo.features) {
  const iso = (f.properties.ISO_A2_EH || '').toLowerCase();
  if (!iso || iso === '-99') continue;
  (byIso[iso] = byIso[iso] || []).push(f);
}

// Vaste middelpunten waar het grootste stuk land niet de juiste plek geeft
const FIX = { nl: [5.3, 52.2], fr: [2.4, 46.6], no: [9.5, 61.5], us: [-98, 39], ca: [-100, 57], ru: [95, 62], dk: [9.3, 56], gb: [-1.8, 53.2], nz: [172.5, -41.5], cl: [-71, -33], id: [113.5, -1.5], jp: [138.5, 36.5], ph: [122, 12.5], it: [12.5, 42.8] };

const countries = {};
for (const [iso, feats] of Object.entries(byIso)) {
  const polys = [];
  for (const f of feats) {
    const g = f.geometry;
    const list = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const c of list) polys.push(c);
  }
  if (!polys.length) continue;
  const d = encode({ type: 'MultiPolygon', coordinates: polys });
  if (!d) continue;
  // Hoofdgebied: het grootste stuk plus de stukken binnen 900 km daarvan
  const areas = polys.map(c => d3.geoArea({ type: 'Polygon', coordinates: c }));
  const big = areas.indexOf(Math.max(...areas));
  const bigC = d3.geoCentroid({ type: 'Polygon', coordinates: polys[big] });
  const main = polys.filter((c, i) => i === big || (d3.geoDistance(bigC, d3.geoCentroid({ type: 'Polygon', coordinates: c })) * 6371 < 900 && areas[i] > areas[big] * 0.002));
  const mainGeom = { type: 'MultiPolygon', coordinates: main };
  const [[x0, y0], [x1, y1]] = d3.geoPath(proj).bounds(mainGeom);
  const ll = FIX[iso] || d3.geoCentroid(mainGeom);
  const r1 = v => Math.round(v * 10) / 10;
  countries[iso] = {
    d,
    bb: [r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0)],
    c: proj(ll).map(r1),
    ll: ll.map(v => Math.round(v * 100) / 100),
    ...(Math.max(x1 - x0, y1 - y0) < 4 ? { tiny: true } : {}),
  };
}

const gp = d3.geoPath(proj);
const r = s => s.replace(/(\.\d)\d+/g, '$1');
const out = `// Gegenereerd door tools/build-world.js, niet met de hand aanpassen.
// Bron: Natural Earth (publiek domein). Projectie: Natural Earth I.
const WORLD = ${JSON.stringify({ viewBox: `0 0 ${W} ${H}`, sphere: r(gp({ type: 'Sphere' })), graticule: r(gp(d3.geoGraticule().step([30, 30])())), countries })};
`;
fs.writeFileSync(path.join(__dirname, '../world-data.js'), out);
console.log('landen:', Object.keys(countries).length, 'kB:', Math.round(out.length / 1024), 'klein:', Object.keys(countries).filter(k => countries[k].tiny).join(' '));
