function normalizeMimeType(mimeType?: string | null) {
  return mimeType?.split(';', 1)[0]?.trim().toLowerCase() ?? null;
}

export function inferExtensionFromMimeType(mimeType?: string | null) {
  switch (normalizeMimeType(mimeType)) {
    case 'application/pdf':
      return '.pdf';
    case 'application/zip':
      return '.zip';
    case 'application/json':
      return '.json';
    case 'text/plain':
      return '.txt';
    case 'text/csv':
      return '.csv';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '.docx';
    default:
      return '';
  }
}

export function resolveDownloadFilename(
  filename: string | null | undefined,
  fallbackBaseName: string,
  mimeType?: string | null,
) {
  const normalizedFilename = filename?.trim();
  if (normalizedFilename) {
    return normalizedFilename;
  }

  return `${fallbackBaseName}${inferExtensionFromMimeType(mimeType)}`;
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 0);
}

export function downloadFileFromUrl(url: URL, filename: string) {
  const anchor = document.createElement('a');

  anchor.href = url.toString();
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
