import fs from 'node:fs';
import crypto from 'node:crypto';

const manifests = [
  '../config/deployment/backend-contract.json',
  '../config/deployment/files-contract.json',
].map((manifestPath) =>
  JSON.parse(fs.readFileSync(new URL(manifestPath, import.meta.url), 'utf8')),
);

const verified = manifests.map((manifest) => {
  const generatedUrl = new URL(`../${manifest.generatedClient}`, import.meta.url);
  const generated = fs.readFileSync(generatedUrl, 'utf8');
  const generatedChecksum = crypto
    .createHash('sha256')
    .update(generated)
    .digest('hex');
  const checksumLine = `Source SHA-256: ${manifest.openApiSha256}`;

  if (!generated.includes(checksumLine)) {
    throw new Error(
      `${manifest.generatedClient} is not pinned to ${manifest.openApiSha256}.`,
    );
  }
  if (generatedChecksum !== manifest.generatedClientSha256) {
    throw new Error(
      `${manifest.generatedClient} checksum mismatch: expected ${manifest.generatedClientSha256}, received ${generatedChecksum}.`,
    );
  }

  if (manifest.vendoredContract) {
    const vendored = fs.readFileSync(
      new URL(`../${manifest.vendoredContract}`, import.meta.url),
    );
    const vendoredChecksum = crypto
      .createHash('sha256')
      .update(vendored)
      .digest('hex');
    if (vendoredChecksum !== manifest.openApiSha256) {
      throw new Error(
        `${manifest.vendoredContract} checksum mismatch: expected ${manifest.openApiSha256}, received ${vendoredChecksum}.`,
      );
    }
  }

  return {
    backendRevision: manifest.backendRevision,
    openApiVersion: manifest.openApiVersion,
    openApiSha256: manifest.openApiSha256,
    generatedClient: manifest.generatedClient,
    generatedClientSha256: generatedChecksum,
  };
});

console.log(
  JSON.stringify({
    valid: true,
    contracts: verified,
  }),
);
