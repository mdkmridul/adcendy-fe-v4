function extractDigest(value) {
  const match = String(value ?? '').match(/(?:^|@)(sha256:[a-f0-9]{64})$/i);
  if (!match) {
    throw new Error('Image reference must end with an immutable sha256 digest.');
  }
  return match[1].toLowerCase();
}

export function verifyImagePromotion(approvedUatImage, productionCandidateImage) {
  const approvedDigest = extractDigest(approvedUatImage);
  const candidateDigest = extractDigest(productionCandidateImage);
  if (approvedDigest !== candidateDigest) {
    throw new Error(
      `Production candidate digest does not match the UAT-approved digest.`,
    );
  }
  return approvedDigest;
}

if (process.argv[1]?.endsWith('verify-image-promotion.mjs')) {
  try {
    const digest = verifyImagePromotion(process.argv[2], process.argv[3]);
    console.log(JSON.stringify({ valid: true, digest }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Promotion rejected.');
    process.exitCode = 1;
  }
}
