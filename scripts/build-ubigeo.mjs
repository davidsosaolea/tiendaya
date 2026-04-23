/**
 * Build script: transforms raw UBIGEO JSON data into a compact hierarchical
 * JS data module for use in the storefront checkout form.
 *
 * Input:  downloaded departamentos.json, provincias.json, distritos.json
 * Output: src/data/peruUbigeo.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Read raw JSON data (strip markdown headers from downloaded files)
function readJsonFromMd(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  // The JSON content is after the "---" separator
  const parts = raw.split('---');
  const jsonStr = parts.length > 1 ? parts[parts.length - 1].trim() : raw.trim();
  return JSON.parse(jsonStr);
}

const depsPath = '/home/bbchanchis/.gemini/antigravity/brain/3f147030-c97e-44a9-8008-9db43a9b3414/.system_generated/steps/42/content.md';
const provsPath = '/home/bbchanchis/.gemini/antigravity/brain/3f147030-c97e-44a9-8008-9db43a9b3414/.system_generated/steps/48/content.md';
const distsPath = '/home/bbchanchis/.gemini/antigravity/brain/3f147030-c97e-44a9-8008-9db43a9b3414/.system_generated/steps/49/content.md';

const departamentos = readJsonFromMd(depsPath);  // array
const provincias = readJsonFromMd(provsPath);      // { dep_id: [provs] }
const distritos = readJsonFromMd(distsPath);       // { prov_id: [dists] }

// Build the hierarchical structure
// Format: { departamentos: [ { name, id, provincias: [ { name, id, distritos: [string] } ] } ] }
const result = [];

for (const dep of departamentos) {
  const depId = dep.id_ubigeo;
  const depName = dep.nombre_ubigeo;

  const provList = provincias[depId] || [];
  const provs = [];

  for (const prov of provList) {
    const provId = prov.id_ubigeo;
    const provName = prov.nombre_ubigeo;

    const distList = distritos[provId] || [];
    const dists = distList.map(d => d.nombre_ubigeo).sort();

    provs.push({ name: provName, distritos: dists });
  }

  // Sort provincias
  provs.sort((a, b) => a.name.localeCompare(b.name));

  result.push({ name: depName, provincias: provs });
}

// Sort departamentos
result.sort((a, b) => a.name.localeCompare(b.name));

// Also add "Callao" which is a constitutional province (sometimes listed separately)
// Check if it's already in the data
const hasCallao = result.some(d => d.name === 'Callao');
if (!hasCallao) {
  // Callao is sometimes under Lima, let's check
  console.log('Note: Callao not found as department - check if it\'s under Lima');
}

// Write output
const outDir = resolve(root, 'src/data');
mkdirSync(outDir, { recursive: true });

const output = `// Peru UBIGEO data — auto-generated, do not edit manually
// Source: github.com/joseluisq/ubigeos-peru (MIT license)

const PERU_UBIGEO = ${JSON.stringify(result)};

export default PERU_UBIGEO;
`;

writeFileSync(resolve(outDir, 'peruUbigeo.js'), output, 'utf-8');

console.log(`✅ Generated peruUbigeo.js with ${result.length} departamentos`);
let totalProvs = 0, totalDists = 0;
for (const dep of result) {
  totalProvs += dep.provincias.length;
  for (const prov of dep.provincias) {
    totalDists += prov.distritos.length;
  }
}
console.log(`   ${totalProvs} provincias, ${totalDists} distritos`);
