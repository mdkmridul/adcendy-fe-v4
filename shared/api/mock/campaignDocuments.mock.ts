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

const documents: CampaignDocument[] = [];

async function delay(ms = 150) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const campaignDocumentsMockAdapter = {
  async listDocuments(
    campaignId: string,
  ): Promise<CampaignDocumentList> {
    await delay();
    const items = documents.filter((item) => item.campaignId === campaignId);
    return {
      items,
      meta: {
        page: 1,
        pageSize: 100,
        total: items.length,
        hasNext: false,
      },
    };
  },

  async uploadDocument(
    campaignId: string,
    input: CampaignDocumentUploadInput,
    options: CampaignDocumentUploadOptions = {},
  ): Promise<CampaignDocument> {
    options.onProgress?.(25);
    await delay();
    if (options.signal?.aborted) {
      throw new DOMException('Document upload was cancelled.', 'AbortError');
    }
    options.onProgress?.(100);
    const now = new Date().toISOString();
    const document: CampaignDocument = {
      documentId: crypto.randomUUID(),
      campaignId,
      title: input.title?.trim() || null,
      description: input.description?.trim() || null,
      fileName: input.file.name,
      fileSizeBytes: input.file.size,
      contentType: input.file.type || 'application/octet-stream',
      availableAt: input.availableAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    documents.unshift(document);
    return document;
  },

  async getDownload(
    _campaignId: string,
    _documentId: string,
  ): Promise<CampaignDocumentDownload> {
    await delay();
    throw new Error('Document downloads are unavailable in mock mode.');
  },

  async listArtifacts(): Promise<CampaignArtifactList> {
    await delay();
    return {
      items: [],
      meta: { page: 1, pageSize: 100, total: 0, hasNext: false },
    };
  },

  async getArtifactDownload(
    _campaignId: string,
    _artifactId: string,
  ): Promise<CampaignArtifactDownload> {
    await delay();
    throw new Error('Artifact downloads are unavailable in mock mode.');
  },

  async requestPdfArtifact(): Promise<CampaignArtifactTrigger> {
    await delay();
    return {
      artifactId: crypto.randomUUID(),
      runId: crypto.randomUUID(),
      status: 'QUEUED',
    };
  },
};
