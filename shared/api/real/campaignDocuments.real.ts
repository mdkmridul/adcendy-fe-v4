import { getToken } from '@/features/auth/auth';
import { ApiError, normalizeError } from '@/shared/api/errors';
import { http } from '@/shared/api';
import { makeRequestId } from '@/shared/api/requestId';
import type { components } from '@/src/generated/files-v1';
import type {
  CampaignArtifactDownload,
  CampaignArtifactList,
  CampaignArtifactTrigger,
  CampaignDocument,
  CampaignDocumentDownload,
  CampaignDocumentList,
  CampaignDocumentUploadInput,
  CampaignDocumentUploadOptions,
} from '@/shared/types/campaignDocument';

type DocumentEnvelope = components['schemas']['DocumentEnvelope'];
type ErrorEnvelope = components['schemas']['ErrorEnvelope'];

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function toUploadError(
  status: number,
  requestId: string,
  payload: ErrorEnvelope | null,
): ApiError {
  const error = normalizeError(
    payload?.message ?? 'Document upload failed.',
    status,
    payload?.requestId ?? requestId,
  );
  error.code = payload?.errorCode;
  error.details = payload?.details;
  return error;
}

function uploadDocument(
  campaignId: string,
  input: CampaignDocumentUploadInput,
  options: CampaignDocumentUploadOptions = {},
): Promise<CampaignDocument> {
  if (typeof XMLHttpRequest === 'undefined') {
    return Promise.reject(
      new ApiError({
        kind: 'Network',
        message: 'Document upload requires a browser environment.',
      }),
    );
  }

  const requestId = makeRequestId();
  const token = getToken();
  const body = new FormData();
  body.append('file', input.file);
  if (input.title?.trim()) body.append('title', input.title.trim());
  if (input.description?.trim()) {
    body.append('description', input.description.trim());
  }
  if (input.availableAt) body.append('availableAt', input.availableAt);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();

    request.open(
      'POST',
      `/v1/campaigns/${encodePathSegment(campaignId)}/documents`,
    );
    request.withCredentials = true;
    request.responseType = 'json';
    request.setRequestHeader('X-Request-Id', requestId);
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);

    request.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      options.onProgress?.(
        Math.min(100, Math.round((event.loaded / event.total) * 100)),
      );
    });

    request.addEventListener('load', () => {
      options.signal?.removeEventListener('abort', abort);
      const payload = request.response as DocumentEnvelope | ErrorEnvelope | null;
      if (request.status >= 200 && request.status < 300) {
        const envelope = payload as DocumentEnvelope | null;
        if (envelope?.data?.documentId) {
          options.onProgress?.(100);
          resolve(envelope.data);
          return;
        }
        reject(
          new ApiError({
            kind: 'Server',
            status: request.status,
            code: 'INVALID_UPLOAD_RESPONSE',
            requestId,
            message: 'Document upload returned an invalid response.',
          }),
        );
        return;
      }
      reject(
        toUploadError(
          request.status,
          requestId,
          payload as ErrorEnvelope | null,
        ),
      );
    });
    request.addEventListener('error', () => {
      options.signal?.removeEventListener('abort', abort);
      reject(
        new ApiError({
          kind: 'Network',
          requestId,
          message: 'Document upload failed because of a network error.',
        }),
      );
    });
    request.addEventListener('abort', () => {
      options.signal?.removeEventListener('abort', abort);
      reject(
        new DOMException('Document upload was cancelled.', 'AbortError'),
      );
    });

    if (options.signal?.aborted) {
      reject(new DOMException('Document upload was cancelled.', 'AbortError'));
      return;
    }
    options.signal?.addEventListener('abort', abort, { once: true });
    request.send(body);
  });
}

export const campaignDocumentsRealAdapter = {
  async listDocuments(
    campaignId: string,
    page = 1,
    pageSize = 100,
  ): Promise<CampaignDocumentList> {
    const response = await http<components['schemas']['DocumentListEnvelope']>(
      `/v1/campaigns/${encodePathSegment(campaignId)}/documents`,
      { query: { page, pageSize } },
    );
    return response.data;
  },

  uploadDocument,

  async getDownload(
    campaignId: string,
    documentId: string,
  ): Promise<CampaignDocumentDownload> {
    const response = await http<
      components['schemas']['DocumentDownloadEnvelope']
    >(
      `/v1/campaigns/${encodePathSegment(campaignId)}/documents/${encodePathSegment(documentId)}/download`,
    );
    return response.data;
  },

  async listArtifacts(
    campaignId: string,
    page = 1,
    pageSize = 100,
  ): Promise<CampaignArtifactList> {
    const response = await http<components['schemas']['ArtifactListEnvelope']>(
      `/v1/campaigns/${encodePathSegment(campaignId)}/artifacts`,
      { query: { page, pageSize } },
    );
    return response.data;
  },

  async getArtifactDownload(
    campaignId: string,
    artifactId: string,
  ): Promise<CampaignArtifactDownload> {
    const response = await http<
      components['schemas']['ArtifactDownloadEnvelope']
    >(
      `/v1/campaigns/${encodePathSegment(campaignId)}/artifacts/${encodePathSegment(artifactId)}/download`,
    );
    return response.data;
  },

  async requestPdfArtifact(
    campaignId: string,
    runId?: string,
  ): Promise<CampaignArtifactTrigger> {
    const response = await http<
      components['schemas']['ArtifactTriggerEnvelope']
    >(`/v1/campaigns/${encodePathSegment(campaignId)}/artifacts/pdf`, {
      method: 'POST',
      query: runId ? { runId } : undefined,
    });
    return response.data;
  },
};
