// Marks each build output with the module system it actually contains, so
// Node picks the right one regardless of the consumer's "type" field.
import { writeFile } from 'node:fs/promises';

await writeFile('dist/esm/package.json', JSON.stringify({ type: 'module' }, null, 2) + '\n');
await writeFile('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');
console.log('wrote dist/esm/package.json and dist/cjs/package.json');
