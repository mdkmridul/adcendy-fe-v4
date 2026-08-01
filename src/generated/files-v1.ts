/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated from: contracts/backend/files-v1/2.0.0/adcendy-files.openapi.json
 * Source SHA-256: 5609111fab1a4212749153af32efc0c2677ffdfbb2eba6c9c590f08de64506b9
 *
 * To regenerate, run: npm run gen:api -- <openapi-source> <output-path>
 */

export interface paths {
    "/v1/campaigns/{campaignId}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List campaign documents
         * @description Client File Hub operation. Clients see only their owned campaign and documents whose availableAt time has arrived. Admins may list any campaign.
         */
        get: operations["listCampaignDocuments"];
        put?: never;
        /**
         * Upload or replace a campaign document
         * @description Administrative publishing operation. An assigned reviewer may upload only to the assigned campaign. The normal client UI does not upload files through this route.
         */
        post: operations["uploadCampaignDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/campaigns/{campaignId}/documents/{documentId}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a document download URL
         * @description Client File Hub operation. The URL is short-lived and must not be cached or reused after its expiresAt value.
         */
        get: operations["getCampaignDocumentDownload"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ResponseMeta: {
            requestId: string | null;
            /** Format: date-time */
            timestamp: string;
        };
        ErrorEnvelope: {
            statusCode: number;
            /** @enum {string} */
            errorCode: "FILE_TOO_LARGE" | "UNSUPPORTED_FILE_TYPE" | "FILE_MISSING" | "CAMPAIGN_NOT_FOUND" | "DOCUMENT_NOT_FOUND" | "UPLOAD_NOT_PERMITTED" | "DOWNLOAD_NOT_PERMITTED" | "DOCUMENT_NOT_AVAILABLE" | "STORAGE_UNAVAILABLE" | "SIGNED_URL_GENERATION_FAILED" | "AUTHENTICATION_REQUIRED" | "VALIDATION_ERROR" | "FORBIDDEN" | "RATE_LIMITED" | "INTERNAL_ERROR";
            message: string;
            details: unknown;
            requestId: string | null;
        };
        PaginationMeta: {
            page: number;
            pageSize: number;
            total: number;
            hasNext: boolean;
        };
        Document: {
            documentId: string;
            campaignId: string;
            title: string | null;
            description: string | null;
            fileName: string;
            fileSizeBytes: number | null;
            contentType: string;
            /** Format: date-time */
            availableAt: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        DocumentList: {
            items: components["schemas"]["Document"][];
            meta: components["schemas"]["PaginationMeta"];
        };
        DocumentUploadRequest: {
            /**
             * Format: binary
             * @description Maximum 25 MiB. Supported: PDF, Word, Excel, PowerPoint, CSV, text, Markdown, JPEG, and PNG.
             */
            file: string;
            title?: string;
            description?: string;
            /** Format: date-time */
            availableAt?: string;
        };
        DocumentDownload: {
            documentId: string;
            /** Format: uri */
            downloadUrl: string;
            /** Format: date-time */
            expiresAt: string;
            fileName: string;
            contentType: string;
        };
        DocumentListEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["DocumentList"];
            meta: components["schemas"]["ResponseMeta"];
        };
        DocumentEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["Document"];
            meta: components["schemas"]["ResponseMeta"];
        };
        DocumentDownloadEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["DocumentDownload"];
            meta: components["schemas"]["ResponseMeta"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: {
        /** @description Request correlation identifier. */
        RequestId: string;
        /** @description Response caching policy. Signed URL responses are expected to be no-store. */
        CacheControl: string;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listCampaignDocuments: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated document list. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentListEnvelope"];
                };
            };
            /** @description Authentication is required. */
            401: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The authenticated actor is not permitted. */
            403: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The campaign or requested resource was not found. */
            404: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    uploadCampaignDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["DocumentUploadRequest"];
            };
        };
        responses: {
            /** @description Document uploaded. */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentEnvelope"];
                };
            };
            /** @description The file part is missing or metadata is invalid. */
            400: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication is required. */
            401: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The authenticated actor is not permitted. */
            403: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The campaign or requested resource was not found. */
            404: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The file exceeds the 25 MiB limit. */
            413: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The file content type is unsupported. */
            415: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Object storage is temporarily unavailable. */
            503: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getCampaignDocumentDownload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
                documentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Download authorization and signed URL. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentDownloadEnvelope"];
                };
            };
            /** @description Authentication is required. */
            401: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The authenticated actor is not permitted. */
            403: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The campaign or requested resource was not found. */
            404: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The document is not yet available. */
            409: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description The signed URL could not be generated. */
            503: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
}
