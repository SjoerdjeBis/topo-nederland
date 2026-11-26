// Gedeelde hulpfuncties voor de kaart-bouwscripts.
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const { execFileSync } = require('child_process');

const DATA = path.join(__dirname, 'data');
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

// Overpass via curl: zware queries duren soms minuten, langer dan Node's fetch wacht
function overpass(queryFile, dest) {
  let last;
  for (const url of OVERPASS) {
    try {
      execFileSync('curl', ['-sS', '-f', '-m', '900', '-A', 'topo-nederland-map-builder',
        '--data-urlencode', 'data@' + queryFile, '-o', dest, url]);
      JSON.parse(fs.readFileSync(dest, 'utf8'));
      return;
    } catch (e) {
      last = `${url}: ${e.message.split('\n')[0]}`;
      fs.rmSync(dest, { force: true });
    }
  }
  throw new Error('Overpass faalde: ' + last);
}

// Bronnen: URL (gewoon ophalen) of bestandsnaam van een Overpass-query in tools/
async function download(sources) {
  fs.mkdirSync(DATA, { recursive: true });
  for (const [file, src] of Object.entries(sources)) {
    const dest = path.join(DATA, file);
    if (fs.existsSync(dest)) continue;
    console.log('download', file);
    if (!src.startsWith('http')) { overpass(path.join(__dirname, src), dest); continue; }
    const res = await fetch(src);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
}
const read = f => JSON.parse(fs.readFileSync(path.join(DATA, f)));

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

// Projectie van RD-meters naar SVG-eenheden voor één viewport
function projector({ X0, Y1, M }) {
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
  const point = lonlat => sv(rd(lonlat)).map(n => +n.toFixed(1));
  return { sv, geomPath, point };
}

const cleanPoly = f => {
  const polys = (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
    .map(p => p.filter(r => r.length >= 4)).filter(p => p.length);
  return turf.feature({ type: 'MultiPolygon', coordinates: polys });
};
const pArea = p => p.geometry.coordinates.reduce((a, r, i) => { let s = 0; for (let j = 0; j < r.length - 1; j++) s += r[j][0] * r[j + 1][1] - r[j + 1][0] * r[j][1]; return a + (i ? -1 : 1) * Math.abs(s / 2); }, 0);

// Schrijft een JS-bestand met één constante; geneste objecten één regel per sleutel
function writeData(file, constName, out, header) {
  const lines = [...header, `const ${constName} = {`];
  const entry = (k, v, ind) => `${ind}${JSON.stringify(k)}: ${JSON.stringify(v)},`;
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'string') lines.push(entry(k, v, '  '));
    else { lines.push(`  ${JSON.stringify(k)}: {`); for (const [k2, v2] of Object.entries(v)) lines.push(entry(k2, v2, '    ')); lines.push('  },'); }
  }
  lines.push('};', '');
  fs.writeFileSync(file, lines.join('\n'));
  console.log('geschreven:', file);
}

module.exports = { DATA, download, read, rd, toRD, projector, cleanPoly, pArea, writeData };
