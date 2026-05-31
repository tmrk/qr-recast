import { qrTypeFixtures } from '../src/lib/qr-types/fixtures.js';
import { detectQrType } from '../src/lib/qr-types/index.js';

const failures = [];

for (const fixture of qrTypeFixtures) {
  const result = detectQrType(fixture.payload);

  if (result.type !== fixture.type) {
    failures.push(`${fixture.name}: expected ${fixture.type}, received ${result.type}.`);
    continue;
  }

  const fieldKeys = new Set(result.fields.map((field) => field.key));

  for (const key of fixture.fieldKeys) {
    if (!fieldKeys.has(key)) {
      failures.push(`${fixture.name}: missing field "${key}".`);
    }
  }

  for (const [key, expectedValue] of Object.entries(fixture.expectedFields ?? {})) {
    const field = result.fields.find((candidate) => candidate.key === key);

    if (field?.value !== expectedValue) {
      failures.push(
        `${fixture.name}: expected field "${key}" to be "${expectedValue}", received "${field?.value ?? ''}".`,
      );
    }
  }
}

for (const payload of ['', 'not a URI', 'WIFI:;', 'MT:???', 'mailto:%']) {
  detectQrType(payload);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
